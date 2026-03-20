#!/bin/bash
echo "GET /feign/posts"
curl -s http://localhost:3000/feign/posts
echo -e "\n\nGET /feign/posts?userId=1"
curl -s "http://localhost:3000/feign/posts?userId=1"
echo -e "\n\nGET /feign/posts/1"
curl -s http://localhost:3000/feign/posts/1
echo -e "\n\nPOST /feign/posts"
curl -s -X POST -H 'Content-Type: application/json' -d '{"title":"New Post","body":"This is a new post","userId":2}' http://localhost:3000/feign/posts
echo -e "\n\nPATCH /feign/posts/1"
curl -s -X PATCH -H 'Content-Type: application/json' -d '{"title":"Updated Title"}' http://localhost:3000/feign/posts/1
echo -e "\n\nDELETE /feign/posts/1"
curl -s -X DELETE http://localhost:3000/feign/posts/1
echo -e "\n"

echo "GET /feign/comments?postId=1"
curl -s "http://localhost:3000/feign/comments?postId=1"
echo -e "\n\nPOST /feign/comments"
curl -s -X POST -H 'Content-Type: application/json' -d '{"body":"Great post!","postId":2,"userId":2}' http://localhost:3000/feign/comments
echo -e "\n"
