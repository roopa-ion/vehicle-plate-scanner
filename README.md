# Vehicle Plate Scanner

An Expo/React Native Android app that:
1. Takes a photo or selects a vehicle image.
2. Sends the image to a configurable analysis API.
3. Displays number plate, vehicle make/model, colour and description.

## Important limitation

A photo containing ONLY a number plate does not visually contain enough information to determine the vehicle's colour or model. The app therefore supports two approaches:

- `AI_IMAGE` mode: send a photo of the whole vehicle to an AI vision endpoint.
- `PLATE_LOOKUP` mode: OCR/plate recognition is performed by your backend, which can then query a lawful vehicle-registration database/API.

You must supply your own backend/API. Do not put a private API key directly inside the mobile app.

## Run in Replit

1. Import this repository into Replit.
2. Open Shell.
3. Run:
   npm install
4. Start:
   npx expo start

For an installable APK, use EAS:
   npx eas-cli@latest login
   npx eas-cli@latest build -p android --profile preview

The build will produce an APK download link.

## API contract

Set the API URL in `src/config.ts`.

POST the image as multipart/form-data:

field: image
filename: vehicle.jpg
type: image/jpeg

Expected JSON response:

{
  "plateNumber": "KA01AB1234",
  "make": "Example",
  "model": "Example Model",
  "colour": "White",
  "description": "Four-door passenger car...",
  "confidence": 0.91,
  "source": "AI_IMAGE"
}

If your backend cannot identify a field, return null or an empty string.

## GitHub + APK

The repository includes `.github/workflows/build-apk.yml`.
For GitHub Actions, add an `EXPO_TOKEN` repository secret from your Expo account, then run the workflow manually. The workflow calls EAS and downloads the resulting APK as a GitHub Actions artifact.
