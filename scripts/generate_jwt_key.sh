#!/bin/bash

mkdir -p .secret
openssl genrsa -out .secret/jwt.key 2048
openssl rsa -in .secret/jwt.key -pubout -outform PEM -out .secret/jwt.key.pub
