import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert,
} from "react-native";
import { supabase } from "../lib/supabase";

export default function HomeScreen({ navigation }) {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", fetchEvents);
    return unsubscribe;
  }, [navigation]);

  async function fetchEvents() {
    const { data, error } = await supabase
      .from("events")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) Alert.alert("Error", error.message);
    else setEvents(data);
  }

  async function logout() {
    await supabase.auth.signOut();
  }

  async function deleteEvent(id) {
    const { error } = await supabase.from("events").delete().eq("id", id);
    if (error) Alert.alert("Error", error.message);
    else fetchEvents();
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate("AddEvent")}
      >
        <Text style={styles.addText}>+ Add Family Event</Text>
      </TouchableOpacity>

      <FlatList
        data={events}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={<Text style={styles.empty}>No events yet.</Text>}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate("EventDetail", { event: item })}
          >
            <Text style={styles.title}>{item.title}</Text>
            <Text>Date: {item.event_date || "No date"}</Text>
            <Text>Budget: ₱{Number(item.budget).toFixed(2)}</Text>

            <TouchableOpacity onPress={() => deleteEvent(item.id)}>
              <Text style={styles.delete}>Delete</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        )}
      />

      <TouchableOpacity onPress={logout}>
        <Text style={styles.logout}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#f8fafc" },
  addButton: {
    backgroundColor: "#2563eb",
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
  },
  addText: { color: "white", fontWeight: "bold", textAlign: "center" },
  card: {
    backgroundColor: "white",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  title: { fontSize: 18, fontWeight: "bold", marginBottom: 5 },
  delete: { color: "red", marginTop: 10, fontWeight: "bold" },
  logout: {
    textAlign: "center",
    color: "red",
    fontWeight: "bold",
    marginTop: 10,
  },
  empty: { textAlign: "center", marginTop: 30, color: "#64748b" },
});
