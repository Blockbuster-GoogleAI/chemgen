from flask import Flask, request, jsonify
from app import app as original_app

# this is the handler Vercel will use
app = original_app
