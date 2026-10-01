import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { ANALYZE_API_URL } from "./src/config";
import { VehicleResult } from "./src/types";

export default function App() {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [result, setResult] = useState<VehicleResult | null>(null);
  const [loading, setLoading] = useState(false);

  const chooseImage = async (camera: boolean) => {
    let response: ImagePicker.ImagePickerResult;

    if (camera) {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        Alert.alert("Camera permission", "Please allow camera access in Android settings.");
        return;
      }
      response = await ImagePicker.launchCameraAsync({
        mediaTypes: ["images"],
        quality: 0.85,
        allowsEditing: false
      });
    } else {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert("Photo permission", "Please allow photo access.");
        return;
      }
      response = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        quality: 0.85,
        allowsEditing: false
      });
    }

    if (!response.canceled && response.assets?.[0]?.uri) {
      setImageUri(response.assets[0].uri);
      setResult(null);
    }
  };

  const analyze = async () => {
    if (!imageUri) {
      Alert.alert("Select an image", "Take a vehicle photo or select one from the gallery.");
      return;
    }

    if (ANALYZE_API_URL.includes("YOUR-BACKEND-URL")) {
      Alert.alert(
        "Backend not configured",
        "Open src/config.ts and replace ANALYZE_API_URL with your HTTPS analysis endpoint."
      );
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const form = new FormData();
      form.append("image", {
        uri: imageUri,
        name: "vehicle.jpg",
        type: "image/jpeg"
      } as any);

      const response = await fetch(ANALYZE_API_URL, {
        method: "POST",
        body: form,
        headers: { Accept: "application/json" }
      });

      const text = await response.text();
      if (!response.ok) {
        throw new Error(`Server ${response.status}: ${text}`);
      }

      const data = JSON.parse(text);
      setResult(data);
    } catch (error: any) {
      Alert.alert(
        "Analysis failed",
        error?.message || "Could not contact the vehicle analysis server."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Vehicle Plate Scanner</Text>
        <Text style={styles.subtitle}>
          Capture a vehicle image and identify the plate, model, colour and description.
        </Text>

        <View style={styles.imageBox}>
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.preview} />
          ) : (
            <Text style={styles.placeholder}>No vehicle image selected</Text>
          )}
        </View>

        <View style={styles.row}>
          <TouchableOpacity style={styles.button} onPress={() => chooseImage(true)}>
            <Text style={styles.buttonText}>📷 Camera</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.buttonSecondary} onPress={() => chooseImage(false)}>
            <Text style={styles.buttonText}>🖼 Gallery</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.analyzeButton, loading && styles.disabled]}
          onPress={analyze}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.analyzeText}>SCAN & ANALYZE</Text>
          )}
        </TouchableOpacity>

        {result && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Vehicle Details</Text>
            <Info label="Number Plate" value={result.plateNumber} />
            <Info label="Make" value={result.make} />
            <Info label="Model" value={result.model} />
            <Info label="Colour" value={result.colour} />
            <Info
              label="Confidence"
              value={
                typeof result.confidence === "number"
                  ? `${Math.round(result.confidence * 100)}%`
                  : "Not provided"
              }
            />
            <Info label="Description" value={result.description} multiline />
            <Info label="Source" value={result.source} />
          </View>
        )}

        <View style={styles.note}>
          <Text style={styles.noteTitle}>Important</Text>
          <Text style={styles.noteText}>
            For reliable model/colour detection, photograph the whole vehicle, not just the
            number plate. A plate-only image normally requires an authorised registration lookup
            service to map the plate to vehicle details.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Info({
  label,
  value,
  multiline
}: {
  label: string;
  value?: string | number | null;
  multiline?: boolean;
}) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.label}>{label}</Text>
      <Text style={[styles.value, multiline && styles.multiline]}>
        {value === null || value === undefined || value === "" ? "Not available" : String(value)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#f5f7fb" },
  container: { padding: 20, paddingBottom: 40 },
  title: { fontSize: 28, fontWeight: "800", marginTop: 10, color: "#172033" },
  subtitle: { fontSize: 15, lineHeight: 22, color: "#596579", marginTop: 6, marginBottom: 18 },
  imageBox: {
    height: 260,
    borderRadius: 18,
    backgroundColor: "#e8ebf2",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
    marginBottom: 14
  },
  preview: { width: "100%", height: "100%", resizeMode: "cover" },
  placeholder: { color: "#778195", fontSize: 15 },
  row: { flexDirection: "row", gap: 10 },
  button: {
    flex: 1,
    backgroundColor: "#172033",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center"
  },
  buttonSecondary: {
    flex: 1,
    backgroundColor: "#4e5d78",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center"
  },
  buttonText: { color: "#fff", fontWeight: "700" },
  analyzeButton: {
    backgroundColor: "#1769e0",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 12
  },
  disabled: { opacity: 0.6 },
  analyzeText: { color: "#fff", fontWeight: "800", letterSpacing: 0.5 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 18,
    marginTop: 20,
    elevation: 3
  },
  cardTitle: { fontSize: 20, fontWeight: "800", marginBottom: 10, color: "#172033" },
  infoRow: { paddingVertical: 9, borderBottomWidth: 1, borderBottomColor: "#edf0f5" },
  label: { fontSize: 12, fontWeight: "700", color: "#758096", textTransform: "uppercase" },
  value: { fontSize: 16, color: "#172033", marginTop: 3 },
  multiline: { lineHeight: 22 },
  note: {
    backgroundColor: "#fff8e6",
    borderRadius: 14,
    padding: 15,
    marginTop: 18
  },
  noteTitle: { fontWeight: "800", color: "#6d5000", marginBottom: 5 },
  noteText: { color: "#6d5a25", lineHeight: 20 }
});
