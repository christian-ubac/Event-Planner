import { useState } from "react";
import {
    Alert,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { supabase } from "../lib/supabase";

export default function AddEventScreen({ navigation }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [budget, setBudget] = useState("");

  async function saveEvent() {
    const { data: userData } = await supabase.auth.getUser();

    if (!title) return Alert.alert("Required", "Enter event title.");

    const { error } = await supabase.from("events").insert({
      user_id: userData.user.id,
      title,
      description,
      event_date: eventDate || null,
      budget: Number(budget) || 0,
    });

    if (error) Alert.alert("Error", error.message);
    else navigation.goBack();
  }

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Event title"
        value={title}
        onChangeText={setTitle}
      />
      <TextInput
        style={styles.input}
        placeholder="Description"
        value={description}
        onChangeText={setDescription}
      />
      <TextInput
        style={styles.input}
        placeholder="Date YYYY-MM-DD"
        value={eventDate}
        onChangeText={setEventDate}
      />
      <TextInput
        style={styles.input}
        placeholder="Budget ₱"
        keyboardType="numeric"
        value={budget}
        onChangeText={setBudget}
      />

      <TouchableOpacity style={styles.button} onPress={saveEvent}>
        <Text style={styles.buttonText}>Save Event</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#f8fafc" },
  input: {
    backgroundColor: "white",
    padding: 14,
    borderRadius: 12,
    marginBottom: 12,
  },
  button: { backgroundColor: "#16a34a", padding: 15, borderRadius: 12 },  npm run web
  buttonText: { color: "white", textAlign: "center", fontWeight: "bold" },
});
