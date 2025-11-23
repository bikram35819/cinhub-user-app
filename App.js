import React, { useState, useEffect, useRef } from 'react';
import { 
  StyleSheet, Text, View, TextInput, TouchableOpacity, 
  FlatList, Image, ActivityIndicator, Alert, SafeAreaView, ScrollView, KeyboardAvoidingView, Platform
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Video } from 'expo-av';
import { StatusBar } from 'expo-status-bar';
import 'react-native-gesture-handler'; 

// --- CONFIGURATION ---
const API_URL = 'https://cinhub-backend-final.onrender.com/api'; 

const COLORS = {
  background: '#0f0f0f',
  card: '#1e1e1e',
  primary: '#E50914', // Netflix Red
  text: '#ffffff',
  textSec: '#b3b3b3',
  input: '#333333',
  adOverlay: 'rgba(0,0,0,0.9)'
};

const Stack = createStackNavigator();

// --- 1. LOGIN SCREEN ---
function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      const data = await response.json();
      setLoading(false);

      if (response.ok) {
        navigation.replace('Home', { user: data.user, token: data.token });
      } else {
        Alert.alert('Login Failed', data.msg || 'Check email/password');
      }
    } catch (error) {
      setLoading(false);
      Alert.alert('Demo Mode', 'Backend waking up. Entering Demo Mode.');
      navigation.replace('Home', { user: { username: 'Demo', plan: 'BRONZE' }, token: 'demo' });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{flex:1}}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Text style={styles.logo}>CINHUB</Text>
          <Text style={styles.subtitle}>Login to Continue</Text>

          <TextInput 
            style={styles.input} 
            placeholder="Email" 
            placeholderTextColor={COLORS.textSec}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
          />
          <TextInput 
            style={styles.input} 
            placeholder="Password" 
            placeholderTextColor={COLORS.textSec}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <TouchableOpacity style={styles.button} onPress={handleLogin}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Log In</Text>}
          </TouchableOpacity>

          <TouchableOpacity style={{marginTop: 20}} onPress={() => navigation.navigate('SignUp')}>
            <Text style={{color: COLORS.textSec, textAlign: 'center'}}>
              New User? <Text style={{color: COLORS.primary, fontWeight: 'bold'}}>Create Account</Text>
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
      <StatusBar style="light" />
    </SafeAreaView>
  );
}

// --- 2. SIGN UP SCREEN (FIXED LAYOUT) ---
function SignUpScreen({ navigation }) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignUp = async () => {
    // Validation: Referral Code check nahi kar rahe kyunki wo Optional hai
    if(!username || !email || !password) {
      Alert.alert("Error", "Please fill Username, Email and Password");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password, referralCode })
      });
      
      const data = await response.json();
      setLoading(false);

      if (response.ok) {
        Alert.alert("Success", "Account Created! Please Login.");
        navigation.navigate('Login');
      } else {
        Alert.alert('Error', data.msg || 'Registration Failed');
      }
    } catch (error) {
      setLoading(false);
      Alert.alert('Error', 'Could not connect to server');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{flex:1}}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Text style={styles.logo}>JOIN CINHUB</Text>
          <Text style={styles.subtitle}>Create Account</Text>

          <TextInput 
            style={styles.input} placeholder="Username" placeholderTextColor={COLORS.textSec}
            value={username} onChangeText={setUsername}
          />
          <TextInput 
            style={styles.input} placeholder="Email" placeholderTextColor={COLORS.textSec}
            value={email} onChangeText={setEmail} autoCapitalize="none"
          />
          <TextInput 
            style={styles.input} placeholder="Password" placeholderTextColor={COLORS.textSec}
            value={password} onChangeText={setPassword} secureTextEntry
          />
          
          {/* Referral Code - Optional */}
          <TextInput 
            style={styles.input} 
            placeholder="Referral Code (Optional)" 
            placeholderTextColor={COLORS.textSec}
            value={referralCode} 
            onChangeText={setReferralCode}
          />

          {/* BIG VISIBLE BUTTON */}
          <TouchableOpacity style={styles.button} onPress={handleSignUp}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Sign Up</Text>}
          </TouchableOpacity>

          <TouchableOpacity style={{marginTop: 20, paddingBottom: 40}} onPress={() => navigation.navigate('Login')}>
            <Text style={{color: COLORS.textSec, textAlign: 'center'}}>
              Already have an account? <Text style={{color: COLORS.primary, fontWeight: 'bold'}}>Login</Text>
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// --- 3. HOME SCREEN ---
function HomeScreen({ navigation, route }) {
  const { user } = route.params;
  
  const videos = [
    { _id: '1', title: 'Big Buck Bunny', category: 'Animation', thumbnail: 'https://peach.blender.org/wp-content/uploads/title_anouncement.jpg?x11217' },
    { _id: '2', title: 'Sintel', category: 'Fantasy', thumbnail: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8f/Sintel_poster.jpg/800px-Sintel_poster.jpg' }
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Browse</Text>
        <View style={styles.badge}><Text style={styles.badgeText}>{user.plan || 'FREE'}</Text></View>
      </View>

      <FlatList
        data={videos}
        keyExtractor={item => item._id}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.card}
            onPress={() => navigation.navigate('Player', { title: item.title, user })}
          >
            <Image source={{ uri: item.thumbnail }} style={styles.thumb} />
            <View style={styles.info}>
              <Text style={styles.vidTitle}>{item.title}</Text>
              <Text style={styles.vidCat}>{item.category}</Text>
            </View>
          </TouchableOpacity>
        )}
      />
      
      {user.plan === 'BRONZE' && (
        <View style={styles.adBanner}>
          <Text style={styles.adLabel}>SPONSORED AD</Text>
          <Text style={{color:'white'}}>Upgrade to Gold to remove ads!</Text>
        </View>
      )}
    </SafeAreaView>
  );
}

// --- 4. PLAYER SCREEN ---
function PlayerScreen({ route }) {
  const { title, user } = route.params;
  const [showAd, setShowAd] = useState(user.plan === 'BRONZE');
  
  return (
    <View style={styles.playerContainer}>
      <Text style={styles.playerHeader}>{title}</Text>
      
      <View style={styles.videoWrapper}>
        <Video
          style={styles.video}
          source={{ uri: 'http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4' }}
          useNativeControls
          resizeMode="contain"
          shouldPlay={!showAd}
        />

        {showAd && (
          <View style={styles.adOverlay}>
            <Text style={styles.adBigText}>ADVERTISEMENT</Text>
            <Text style={{color:'white', marginBottom:20}}>Video resumes in 5s...</Text>
            <TouchableOpacity style={styles.skipBtn} onPress={() => setShowAd(false)}>
              <Text style={{fontWeight:'bold'}}>SKIP AD</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="SignUp" component={SignUpScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Player" component={PlayerScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  // Fixed Content Style: Scroll enabled, Padding Bottom added
  scrollContent: { padding: 20, paddingTop: 50, paddingBottom: 50, justifyContent: 'center' },
  
  logo: { fontSize: 40, fontWeight: 'bold', color: COLORS.primary, textAlign: 'center', marginBottom: 10 },
  subtitle: { color: COLORS.textSec, textAlign: 'center', marginBottom: 40 },
  input: { backgroundColor: COLORS.input, color: 'white', padding: 15, borderRadius: 8, marginBottom: 15 },
  button: { backgroundColor: COLORS.primary, padding: 15, borderRadius: 8, alignItems: 'center', marginTop: 10 },
  buttonText: { color: 'white', fontWeight: 'bold' },
  
  header: { padding: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: 'white' },
  badge: { backgroundColor: '#ffd700', padding: 5, borderRadius: 4 },
  badgeText: { fontWeight: 'bold', fontSize: 10 },
  
  card: { marginHorizontal: 20, marginBottom: 20, backgroundColor: COLORS.card, borderRadius: 10, overflow: 'hidden' },
  thumb: { width: '100%', height: 180 },
  info: { padding: 10 },
  vidTitle: { color: 'white', fontSize: 18, fontWeight: 'bold' },
  vidCat: { color: COLORS.textSec },
  
  adBanner: { 
    backgroundColor: '#333', 
    margin: 20, 
    padding: 15, 
    alignItems: 'center', 
    borderWidth: 1, 
    borderColor: 'yellow', 
    borderRadius: 8 
  },
  adLabel: { color: 'yellow', fontWeight: 'bold', marginBottom: 5 },
  
  playerContainer: { flex: 1, backgroundColor: 'black', justifyContent: 'center' },
  playerHeader: { color: 'white', fontSize: 20, position: 'absolute', top: 50, left: 20, zIndex: 1 },
  videoWrapper: { width: '100%', height: 250 },
  video: { width: '100%', height: '100%' },
  adOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: COLORS.adOverlay, justifyContent: 'center', alignItems: 'center', zIndex: 99 },
  adBigText: { color: '#ffd700', fontSize: 24, fontWeight: 'bold', marginBottom: 10 },
  skipBtn: { backgroundColor: 'white', padding: 10, borderRadius: 5 }
});
