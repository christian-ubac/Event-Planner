import * as Notifications from "expo-notifications";
import { useEffect, useState } from "react";
import {
    Alert,
    FlatList,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { supabase } from "../lib/supabase";

export default function EventDetailScreen({ route, navigation }) {
  const { event } = route.params;

  const [expenses, setExpenses] = useState([]);
  const [checklist, setChecklist] = useState([]);

  const [expenseName, setExpenseName] = useState("");
  const [expenseAmount, setExpenseAmount] = useState("");
  const [expenseCategory, setExpenseCategory] = useState("");

  const [item, setItem] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    const { data: expenseData } = await supabase
      .from("expenses")
      .select("*")
      .eq("event_id", event.id)
      .order("created_at", { ascending: false });

    const { data: checklistData } = await supabase
      .from("checklist")
      .select("*")
      .eq("event_id", event.id)
      .order("created_at", { ascending: false });

    setExpenses(expenseData || []);
    setChecklist(checklistData || []);
  }

  async function addExpense() {
    const { data: userData } = await supabase.auth.getUser();

    if (!expenseName) return Alert.alert("Required", "Enter expense name.");

    const { error } = await supabase.from("expenses").insert({
      event_id: event.id,
      user_id: userData.user.id,
      name: expenseName,
      amount: Number(expenseAmount) || 0,
      category: expenseCategory,
    });

    if (error) Alert.alert("Error", error.message);
    else {
      setExpenseName("");
      setExpenseAmount("");
      setExpenseCategory("");
      fetchData();
    }
  }

  async function deleteExpense(id) {
    await supabase.from("expenses").delete().eq("id", id);
    fetchData();
  }

  async function addChecklistItem() {
    const { data: userData } = await supabase.auth.getUser();

    if (!item) return Alert.alert("Required", "Enter checklist item.");

    const { error } = await supabase.from("checklist").insert({
      event_id: event.id,
      user_id: userData.user.id,
      item,
    });

    if (error) Alert.alert("Error", error.message);
    else {
      setItem("");
      fetchData();
    }
  }

  async function toggleChecklist(row) {
    await supabase
      .from("checklist")
      .update({ is_done: !row.is_done })
      .eq("id", row.id);
    fetchData();
  }

  async function deleteChecklist(id) {
    await supabase.from("checklist").delete().eq("id", id);
    fetchData();
  }

  async function notifyBudgetWarning() {
    await Notifications.requestPermissionsAsync();

    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Budget Warning",
        body: "Your family event expenses are near or over the budget.",
      },
      trigger: null,
    });
  }

  const totalExpenses = expenses.reduce((sum, e) => sum + Number(e.amount), 0);
  const budget = Number(event.budget);
  const remaining = budget - totalExpenses;
  const percentage = budget > 0 ? (totalExpenses / budget) * 100 : 0;

  let warningText = "✅ Budget is still safe.";
  let warningStyle = styles.safe;

  if (percentage >= 100) {
    warningText = "⚠ Over budget already!";
    warningStyle = styles.danger;
  } else if (percentage >= 80) {
    warningText = "⚠ Warning: You used 80% of your budget.";
    warningStyle = styles.warning;
  }

  useEffect(() => {
    if (percentage >= 80) {
      notifyBudgetWarning();
    }
  }, [percentage]);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>{event.title}</Text>
      <Text style={styles.desc}>{event.description}</Text>

      <View style={styles.reportBox}>
        <Text>Budget: ₱{budget.toFixed(2)}</Text>
        <Text>Total Expenses: ₱{totalExpenses.toFixed(2)}</Text>
        <Text>Remaining: ₱{remaining.toFixed(2)}</Text>
        <Text>Used: {percentage.toFixed(1)}%</Text>
        <Text style={warningStyle}>{warningText}</Text>
      </View>

      <TouchableOpacity
        style={styles.reportButton}
        onPress={() =>
          navigation.navigate("Report", { event, expenses, checklist })
        }
      >
        <Text style={styles.buttonText}>View Simple Report</Text>
      </TouchableOpacity>

      <Text style={styles.section}>Expenses</Text>

      <TextInput
        style={styles.input}
        placeholder="Expense name"
        value={expenseName}
        onChangeText={setExpenseName}
      />
      <TextInput
        style={styles.input}
        placeholder="Amount ₱"
        keyboardType="numeric"
        value={expenseAmount}
        onChangeText={setExpenseAmount}
      />
      <TextInput
        style={styles.input}
        placeholder="Category ex. Food, Decor, Transport"
        value={expenseCategory}
        onChangeText={setExpenseCategory}
      />

      <TouchableOpacity style={styles.button} onPress={addExpense}>
        <Text style={styles.buttonText}>Add Expense</Text>
      </TouchableOpacity>

      <FlatList
        data={expenses}
        keyExtractor={(item) => item.id}
        scrollEnabled={false}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{item.name}</Text>
            <Text>Category: {item.category || "None"}</Text>
            <Text>Amount: ₱{Number(item.amount).toFixed(2)}</Text>

            <TouchableOpacity onPress={() => deleteExpense(item.id)}>
              <Text style={styles.delete}>Delete</Text>
            </TouchableOpacity>
          </View>
        )}
      />

      <Text style={styles.section}>Shopping Checklist</Text>

      <TextInput
        style={styles.input}
        placeholder="Item name"
        value={item}
        onChangeText={setItem}
      />

      <TouchableOpacity style={styles.checkButton} onPress={addChecklistItem}>
        <Text style={styles.buttonText}>Add Checklist Item</Text>
      </TouchableOpacity>

      <FlatList
        data={checklist}
        keyExtractor={(item) => item.id}
        scrollEnabled={false}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <TouchableOpacity onPress={() => toggleChecklist(item)}>
              <Text style={styles.cardTitle}>
                {item.is_done ? "✅" : "⬜"} {item.item}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => deleteChecklist(item.id)}>
              <Text style={styles.delete}>Delete</Text>
            </TouchableOpacity>
          </View>
        )}
      />

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#f8fafc" },
  title: { fontSize: 26, fontWeight: "bold" },
  desc: { color: "#64748b", marginBottom: 15 },
  reportBox: {
    backgroundColor: "white",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  safe: { color: "green", marginTop: 8, fontWeight: "bold" },
  warning: { color: "#d97706", marginTop: 8, fontWeight: "bold" },
  danger: { color: "red", marginTop: 8, fontWeight: "bold" },
  reportButton: {
    backgroundColor: "#9333ea",
    padding: 14,
    borderRadius: 12,
    marginBottom: 15,
  },
  section: { fontSize: 20, fontWeight: "bold", marginTop: 15, marginBottom: 8 },
  input: {
    backgroundColor: "white",
    padding: 13,
    borderRadius: 12,
    marginBottom: 9,
  },
  button: {
    backgroundColor: "#2563eb",
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
  },
  checkButton: {
    backgroundColor: "#16a34a",
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
  },
  buttonText: { color: "white", textAlign: "center", fontWeight: "bold" },
  card: {
    backgroundColor: "white",
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
  },
  cardTitle: { fontWeight: "bold", fontSize: 16 },
  delete: { color: "red", marginTop: 8, fontWeight: "bold" },
});
