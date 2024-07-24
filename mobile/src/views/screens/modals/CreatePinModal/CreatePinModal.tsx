import { isDefined } from "@railgun-community/shared-models";
import React, { useEffect, useRef, useState } from "react";
import {
  Dimensions,
  Image,
  Modal,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
//
import EncryptedStorage from "react-native-encrypted-storage";
import { ButtonTextOnly } from "@components/buttons/ButtonTextOnly/ButtonTextOnly";
import { SwirlBackground } from "@components/images/SwirlBackground/SwirlBackground";
import { PinEntryDots } from "@components/inputs/PinEntryDots/PinEntryDots";
import { PinEntryPanel } from "@components/inputs/PinEntryPanel/PinEntryPanel";
import {
  BiometricsAuthResponse,
  ImageSwirl,
  setAuthKey,
  useAppDispatch,
  useReduxSelector,
} from "@react-shared";
import {
  getOrCreateDbEncryptionKey,
  storeNewDbEncryptionKey,
} from "@services/core/db";
import {
  biometricsAuthenticate,
  getBiometryType,
} from "@services/security/biometrics-service";
import {
  compareEncryptedPin,
  setEncryptedPin,
  setHasBiometricsEnabled,
} from "@services/security/secure-app-service";
import { HapticSurface, triggerHaptic } from "@services/util/haptic-service";
import * as WebBrowser from "@toruslabs/react-native-web-browser";
import { imageHeightFromDesiredWidth } from "@utils/image-utils";
import { EthereumPrivateKeyProvider } from "@web3auth/ethereum-provider";
import Web3Auth, {
  ChainNamespace,
  LOGIN_PROVIDER,
  OPENLOGIN_NETWORK,
} from "@web3auth/react-native-sdk";
import { ErrorDetailsModal } from "../ErrorDetailsModal/ErrorDetailsModal";
import GoogleIcon from "./google.png";
import { styles } from "./styles";

import "@ethersproject/shims";
const scheme = "railway"; // Or your desired app redirection scheme
const redirectUrl = `${scheme}://login`;
const clientId =
  "BMqggIUuV0GVIw86MF90BqsxlkVi6cy-sOByat7_GdwaJfs_p-t-UOTpyOA91OiCmEbSHdYIDOIolUvAu69hAU0"; // get from https://dashboard.web3auth.io

const chainConfig = {
  chainNamespace: ChainNamespace.EIP155,
  chainId: "0xaa36a7",
  rpcTarget: "https://rpc.ankr.com/eth_sepolia",
  // Avoid using public rpcTarget in production.
  // Use services like Infura, Quicknode etc
  displayName: "Ethereum Sepolia Testnet",
  blockExplorerUrl: "https://sepolia.etherscan.io",
  ticker: "ETH",
  tickerName: "Ethereum",
  decimals: 18,
  logo: "https://cryptologos.cc/logos/ethereum-eth-logo.png",
};

const ethereumPrivateKeyProvider = new EthereumPrivateKeyProvider({
  config: {
    chainConfig,
  },
});

const web3auth = new Web3Auth(WebBrowser, EncryptedStorage, {
  clientId,
  redirectUrl,
  network: OPENLOGIN_NETWORK.SAPPHIRE_DEVNET, // or other networks
});

///
type Props = {
  show: boolean;
  dismiss: () => void;
  navigation: any;
};

export const CreatePinModal: React.FC<Props> = ({
  show,
  dismiss,
  navigation,
}) => {
  const [enteredPin, setEnteredPin] = useState("");
  const [error, setError] = useState<Optional<Error>>();
  const inputFrozen = useRef(false);
  const [showErrorDetailsModal, setShowErrorDetailsModal] = useState(false);

  ////
  const [loggedIn, setLoggedIn] = useState(false);
  const [provider, setProvider] = useState<any>(null);

  useEffect(() => {
    const init = async () => {
      await web3auth.init();
      console.log("=======web3auth.privKeydddddddd", web3auth.privKey);
      if (web3auth.privKey) {
        await ethereumPrivateKeyProvider.setupProvider(web3auth.privKey);
        setEnteredPin(web3auth.privKey);
        setProvider(ethereumPrivateKeyProvider);
        setLoggedIn(true);
      }
    };
    init();
  }, []);

  const login = async () => {
    try {
      if (!web3auth.ready) {
        return;
      }

      await web3auth.login({
        loginProvider: LOGIN_PROVIDER.GOOGLE,
      });

      if (web3auth.privKey) {
        await ethereumPrivateKeyProvider.setupProvider(web3auth.privKey);
        setEnteredPin(web3auth.privKey);
        setProvider(ethereumPrivateKeyProvider);
        setLoggedIn(true);
      }
    } catch (e: any) {}
  };

  useEffect(() => {
    if (show && enteredPin) {
      dismiss();
    }
  }, [enteredPin, show]);

  const windowWidth = Dimensions.get("window").width;
  const swirlWidth = windowWidth * 0.8;
  const swirlHeight = imageHeightFromDesiredWidth(ImageSwirl(), swirlWidth);

  return (
    <Modal animationType="slide" presentationStyle="fullScreen" visible={show}>
      <View style={styles.wrapper}>
        <SwirlBackground
          style={{
            ...styles.swirlBackground,
            width: swirlWidth,
            height: swirlHeight,
          }}
        />
        <View style={[styles.pinTitleDotsWrapper]}>
          <Text style={styles.titleText}>{"LOGIN WITH GOOGLE"}</Text>
        </View>
        <View style={styles.pinEntryPanelWrapper}>
          <TouchableOpacity onPress={() => login()}>
            <Image source={GoogleIcon} style={styles.googleIcon} />
          </TouchableOpacity>
        </View>
        <View style={styles.bottomButtons}>
          <View style={styles.bottomButton}>
            <ButtonTextOnly
              title="Cancel"
              onTap={() => {
                dismiss();
                setTimeout(() => {
                  navigation.goBack();
                }, 150);
              }}
              labelStyle={styles.bottomButtonLabel}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};
