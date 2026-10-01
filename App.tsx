import React, { useState } from "react";
import {
  Alert,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import * as ImagePicker from "expo-image-picker";

export default function App() {
  const [imageUri, setImageUri] = useState<string | null>(null);

  const openCamera = async () => {
    try {
      const permission =
        await ImagePicker.requestCameraPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(
          "Camera Permission",
          "Please allow camera permission in Android Settings."
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ["images"],
        quality: 0.8,
        allowsEditing: false,
      });

      if (!result.canceled && result.assets?.length > 0) {
        setImageUri(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert(
        "Camera Error",
        "Unable to open the camera."
      );
    }
  };

  const openGallery = async () => {
    try {
      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(
          "Photo Permission",
          "Please allow photo access."
        );
        return;
      }

      const result =
        await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ["images"],
          quality: 0.8,
          allowsEditing: false,
        });

      if (!result.canceled && result.assets?.length > 0) {
        setImageUri(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert(
        "Gallery Error",
        "Unable to open the gallery."
      );
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>
          Vehicle Plate Scanner
        </Text>

        <Text style={styles.subtitle}>
          Take a vehicle photo or select an image from your gallery.
        </Text>

        <View style={styles.imageBox}>
          {imageUri ? (
            <Image
              source={{ uri: imageUri }}
              style={styles.preview}
            />
          ) : (
            <Text style={styles.placeholder}>
              No image selected
            </Text>
          )}
        </View>

        <TouchableOpacity
          style={styles.cameraButton}
          onPress={openCamera}
        >
          <Text style={styles.buttonText}>
            Camera
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.galleryButton}
          onPress={openGallery}
        >
          <Text style={styles.buttonText}>
            Gallery
          </Text>
        </TouchableOpacity>

        {imageUri && (
          <TouchableOpacity
            style={styles.scanButton}
            onPress={() =>
              Alert.alert(
                "Image Selected",
                "The image was selected successfully. Backend analysis will be connected next."
              )
            }
          >
            <Text style={styles.buttonText}>
              SCAN & ANALYZE
            </Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#f5f7fb",
  },

  container: {
    padding: 20,
    paddingBottom: 40,
  },

  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#172033",
    marginTop: 20,
  },

  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    color: "#596579",
    marginTop: 8,
    marginBottom: 20,
  },

  imageBox: {
    height: 280,
    borderRadius: 18,
    backgroundColor: "#e8ebf2",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
    marginBottom: 16,
  },

  preview: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },

  placeholder: {
    color: "#778195",
    fontSize: 15,
  },

  cameraButton: {
    backgroundColor: "#172033",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 10,
  },

  galleryButton: {
    backgroundColor: "#4e5d78",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 10,
  },

  scanButton: {
    backgroundColor: "#1769e0",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },

  buttonText: {
    color: "#ffffff",
    fontWeight: "800",
    fontSize: 16,
  },
});
