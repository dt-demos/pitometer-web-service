clear

BASE_URL="http://localhost:8080"
URL="$BASE_URL/api/pitometer"

curl -sL -w '%{http_code}' $BASE_URL/version
exit
# see if app is running
if [ "$(curl -sL -w '%{http_code}' $BASE_URL -o /dev/null)" != "200" ]; then
  echo "EXITING: Cannot reach $URL.  Make sure app is running"
  exit
fi
    
# test 1
# loop 100 times
for i in {1..1}; 
  do 

  printf "TEST 1:"
  RESULT=$(curl -s -X POST \
    "$URL" \
    -H 'Content-Type: application/json' \
    -d '@payload1.json' | jq -r '.result')

  printf "."

  if [ "$RESULT" != "pass" ]; then
    echo "EXITING: test 1 result not equal to pass"
    exit
  fi
done
echo "ok"

# test 2
RESULT=$(curl -s -X POST \
  "$URL" \
  -H 'Content-Type: application/json' \
  -d '@payload2.json')

SUBSTRING="The given timeseries id is not configured"

if [[ "$RESULT" != *"$SUBSTRING"* ]]; then
  echo "EXITING: test 2 result does not contain '$SUBSTRING'"
  exit
fi
echo "TEST 2: ok"

# test 3
RESULT=$(curl -s -X POST \
  "$URL" \
  -H 'Content-Type: application/json' \
  -d '@payload3.json' | jq -r '.result')

if [ "$RESULT" != "fail" ]; then
  echo "EXITING: test 3 result not equal to fail"
  exit
fi
echo "TEST 3: ok"

# test 4
RESULT=$(curl -s -X POST \
  "$URL" \
  -H 'Content-Type: application/json' \
  -d '@payload4.json')

SUBSTRING="Missing timeEnd."

if [[ "$RESULT" != *"$SUBSTRING"* ]]; then
  echo "EXITING: test 4 result does not contain '$SUBSTRING'"
  exit
fi
echo "TEST 3: ok"

# test 5
RESULT=$(curl -s -X POST \
  "$URL" \
  -H 'Content-Type: application/json' \
  -d '@payload5.json')

SUBSTRING="Missing timeStart."

if [[ "$RESULT" != *"$SUBSTRING"* ]]; then
  echo "EXITING: test 5 result does not contain '$SUBSTRING'"
  exit
fi
echo "TEST 5: ok"

# test 6
RESULT=$(curl -s -X POST \
  "$URL" \
  -H 'Content-Type: application/json' \
  -d '@payload6.json')

SUBSTRING="Missing perfSpec"

if [[ "$RESULT" != *"$SUBSTRING"* ]]; then
  echo "EXITING: test 6 result does not contain '$SUBSTRING'"
  exit
fi
echo "TEST 6: ok"
