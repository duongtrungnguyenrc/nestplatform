#!/bin/bash
echo "GET /feign/users"
curl -s http://localhost:3000/feign/users
echo -e "\n\nGET /feign/users/1"
curl -s http://localhost:3000/feign/users/1
echo -e "\n\nGET /feign/users/role/admin"
curl -s http://localhost:3000/feign/users/role/admin
echo -e "\n\nPOST /feign/users"
curl -s -X POST -H 'Content-Type: application/json' -d '{"name":"Test User","email":"test@example.com","role":"user"}' http://localhost:3000/feign/users
echo -e "\n\nPUT /feign/users/1"
curl -s -X PUT -H 'Content-Type: application/json' -d '{"name":"Updated User","email":"updated@example.com","role":"admin"}' http://localhost:3000/feign/users/1
echo -e "\n\nPATCH /feign/users/1"
curl -s -X PATCH -H 'Content-Type: application/json' -d '{"role":"guest"}' http://localhost:3000/feign/users/1
echo -e "\n\nDELETE /feign/users/1"
curl -s -X DELETE http://localhost:3000/feign/users/1
echo -e "\n"
