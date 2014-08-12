#!/bin/bash
update_current_database_url(){
  curl -n -X PATCH -sS https://api.heroku.com/apps/$MAIN_APP/config-vars \
    -H "Accept: application/vnd.heroku+json; version=3" \
    -H "Content-Type: application/json" \
    -H "Authorization: $HEROKU_API_KEY_ENC" \
    -d "{\"CURRENT_DATABASE_URL\":\"$DATABASE_URL\"}" \
    -o /dev/null
}

if [[ -z "$CURRENT_DATABASE_URL" ]] ; then
  update_current_database_url
fi

if [ "$CURRENT_DATABASE_URL" != "$DATABASE_URL" ] ; then
  update_current_database_url

  for app in "${database_dependent_apps[@]}"
  do
    echo "-----> Updating DATABASE_URL for $app"
    curl -n -X PATCH -sS https://api.heroku.com/apps/$app/config-vars \
      -H "Accept: application/vnd.heroku+json; version=3" \
      -H "Content-Type: application/json" \
      -H "Authorization: $HEROKU_API_KEY_ENC" \
      -d "{\"DATABASE_URL\":\"$DATABASE_URL\"}" \
      -o /dev/null
  done
fi