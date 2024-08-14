curl -X POST http://localhost:3000/write-nfc \
     -H "Content-Type: application/json" \
     -d '{
           "uid": "042367cc220289",
           "data": "Hello NFC World!"
         }'
