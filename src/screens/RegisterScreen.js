import React, { useState } from "react";
import { View, TextInput, TouchableOpacity, Text, Alert, StyleSheet } from "react-native";
import { supabase } from "../lib/supabase";

export default function RegisterScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function register() {
    const { error } = await supabase.auth.signUp({ email, password });

    if (error) Alert.alert("Register Failed", error.message);
    else {
      Alert.alert("Success", "Account created.");
      navigation.goBack();
      
    }
  }

  return (
    <View style={styles.container}>
      <TextInput style={styles.input} placeholder="Email" autoCapitalize="none" value={email} onChangeText={setEmail} />
      <TextInput style={styles.input} placeholder="Password" secureTextEntry value={password} onChangeText={setPassword} />

      <TouchableOpacity style={styles.button} onPress={register}>
        <Text style={styles.buttonText}>Register</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: "center", backgroundColor: "#f8fafc" },
  input: { backgroundColor: "white", padding: 14, borderRadius: 12, marginBottom: 12 },
  button: { backgroundColor: "#16a34a", padding: 15, borderRadius: 12, alignItems: "center" },
  buttonText: { color: "white", fontWeight: "bold" },
});