import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { HomeScreen } from '../screens/HomeScreen';
import { LoginScreen, RegisterScreen } from '../screens/AuthScreens';
import { PricesScreen, ProductDetailsScreen } from '../screens/CatalogScreens';
import { SettingsScreen, OrdersScreen } from '../screens/AccountScreens';
import { ManageProductsScreen } from '../screens/ManageProductsScreen';
import { OrdersScreen as BuyerOrdersScreen } from '../screens/OrdersScreen';
import { AIScreen } from '../screens/AIScreens';
import { ChangePasswordScreen } from '../screens/UtilityScreens';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function AppNavigator() {
  return <NavigationContainer><Stack.Navigator screenOptions={{ headerShown: false }}><Stack.Screen name="Home" component={HomeScreen} /><Stack.Screen name="Login" component={LoginScreen} /><Stack.Screen name="Register" component={RegisterScreen} /><Stack.Screen name="Prices" component={PricesScreen} /><Stack.Screen name="Product" component={ProductDetailsScreen} /><Stack.Screen name="Orders" component={BuyerOrdersScreen} /><Stack.Screen name="Incoming" component={OrdersScreen} /><Stack.Screen name="ManageProducts" component={ManageProductsScreen} /><Stack.Screen name="Settings" component={SettingsScreen} /><Stack.Screen name="ChangePassword" component={ChangePasswordScreen} /><Stack.Screen name="AIGrading" component={AIScreen} /><Stack.Screen name="Detect" component={() => <AIScreen detect />} /></Stack.Navigator></NavigationContainer>;
}
