import React from "react";
import { LogBox } from "react-native";
import { ClickOutsideProvider } from "react-native-click-outside";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Provider } from "react-redux";
import {
  ActionSheetProvider,
  connectActionSheet,
} from "@expo/react-native-action-sheet";
import { store } from "@react-shared";
import { AppNavigator } from "./AppNavigator";

export const App = () => {
  LogBox.ignoreLogs(['Warning: ...']);

  return (
    <Provider store={store}>
      <ClickOutsideProvider>
        <SafeAreaProvider>
          <ActionSheetProvider>
            <AppNavigator />
          </ActionSheetProvider>
        </SafeAreaProvider>
      </ClickOutsideProvider>
    </Provider>
  );
};

export const ConnectedApp = connectActionSheet(App);
