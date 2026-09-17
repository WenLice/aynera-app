import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { useSyncExternalStore } from "react";
import {
  MeetTabIcon,
  ProfileTabIcon,
  ThreadsTabIcon,
} from "../components/TabIcons";
import { MatchMomentScreen } from "../screens/MatchMomentScreen";
import { MeetScreen } from "../screens/MeetScreen";
import { PendingReviewScreen } from "../screens/PendingReviewScreen";
import { PremiereScreen } from "../screens/PremiereScreen";
import { ProfileScreen } from "../screens/ProfileScreen";
import { ProfileSetupScreen } from "../screens/ProfileSetupScreen";
import { SampleScreen } from "../screens/SampleScreen";
import { SettingsScreen } from "../screens/SettingsScreen";
import { SplashScreen } from "../screens/SplashScreen";
import { ThreadScreen } from "../screens/ThreadScreen";
import { ThreadsScreen } from "../screens/ThreadsScreen";
import { GatheringDetailScreen } from "../screens/GatheringDetailScreen";
import { GatheringReconnectScreen } from "../screens/GatheringReconnectScreen";
import { PlanMeetScreen } from "../screens/PlanMeetScreen";
import { PostMeetFeedbackScreen } from "../screens/PostMeetFeedbackScreen";
import { WaitlistScreen } from "../screens/WaitlistScreen";
import { WelcomeScreen } from "../screens/WelcomeScreen";
import { getUnreadCount, subscribeThreads } from "../state/threads";
import { colors, fonts } from "../theme";
import type { MainTabParamList, RootStackParamList } from "./types";

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

function MainTabs() {
  /** Only unread letters earn a badge, so it can actually reach zero. */
  const unread = useSyncExternalStore(subscribeThreads, getUnreadCount);

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.brandPrimary,
        tabBarInactiveTintColor: colors.textTertiary,
        tabBarStyle: {
          backgroundColor: colors.surfacePrimary,
          borderTopColor: colors.divider,
          borderTopWidth: 1,
          height: 72,
          paddingTop: 8,
          paddingBottom: 10,
          elevation: 0,
          shadowOpacity: 0,
        },
        tabBarLabelStyle: {
          fontFamily: fonts.bodySemi,
          fontSize: 12,
          letterSpacing: 0.4,
          marginTop: 2,
        },
      }}
    >
      <Tab.Screen
        name="Meet"
        component={MeetScreen}
        options={{
          tabBarIcon: ({ color, focused }) => (
            <MeetTabIcon color={color} focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="Threads"
        component={ThreadsScreen}
        options={{
          tabBarBadge: unread > 0 ? unread : undefined,
          tabBarBadgeStyle: {
            backgroundColor: colors.accentPrimaryPressed,
            fontFamily: fonts.bodySemi,
            fontSize: 10,
            minWidth: 16,
            height: 16,
            lineHeight: 14,
          },
          tabBarIcon: ({ color, focused }) => (
            <ThreadsTabIcon color={color} focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ color, focused }) => (
            <ProfileTabIcon color={color} focused={focused} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export function RootNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Splash"
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.backgroundPrimary },
          animation: "fade",
        }}
      >
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="Welcome" component={WelcomeScreen} />
        <Stack.Screen
          name="Sample"
          component={SampleScreen}
          options={{ animation: "slide_from_bottom" }}
        />
        <Stack.Screen name="ProfileSetup" component={ProfileSetupScreen} />
        <Stack.Screen name="Premiere" component={PremiereScreen} />
        <Stack.Screen name="PendingReview" component={PendingReviewScreen} />
        <Stack.Screen name="Waitlist" component={WaitlistScreen} />
        <Stack.Screen name="Main" component={MainTabs} />
        <Stack.Screen
          name="Thread"
          component={ThreadScreen}
          options={{ animation: "slide_from_right" }}
        />
        <Stack.Screen name="MatchMoment" component={MatchMomentScreen} />
        <Stack.Screen
          name="Settings"
          component={SettingsScreen}
          options={{ animation: "slide_from_right" }}
        />
        <Stack.Screen
          name="GatheringDetail"
          component={GatheringDetailScreen}
          options={{ animation: "slide_from_right" }}
        />
        <Stack.Screen
          name="GatheringReconnect"
          component={GatheringReconnectScreen}
        />
        <Stack.Screen name="PlanMeet" component={PlanMeetScreen} />
        <Stack.Screen
          name="PostMeetFeedback"
          component={PostMeetFeedbackScreen}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
