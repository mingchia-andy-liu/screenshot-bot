# Screenshot Bot

This is a reddit bot for posting post-game threads box scores in image forms.

## Dev

### Imgur

Follow [Imgur's API documentation](http://apidocs.imgur.com/?version=latest) to generate tokens. Use PostMan is the easiest solution.

Please refresh access token every month with `Generate Access Token` endpoint.

### Reddit

Follow [Reddit's API Guide](https://github.com/reddit-archive/reddit/wiki/oauth2) and [Reddit OAuth Helper](https://github.com/not-an-aardvark/reddit-oauth-helper) to generate tokens.

## Deployment

1. Run `npm run build` or execute the script `./scripts/build.sh` to generate `app.zip`.
1. Upload the zip file to the GCP project's Cloud function.
