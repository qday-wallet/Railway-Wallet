import {
  isDefined,
  RailgunWalletBalanceBucket,
} from "@railgun-community/shared-models";
import React, { useEffect, useState } from "react";
import EncryptedStorage from "react-native-encrypted-storage";
import {
  hasBalancesForNetworkOrRailgun,
  StorageService,
  useReduxSelector,
} from "@react-shared";
import { CreatePinModal } from "@screens/modals/CreatePinModal/CreatePinModal";
import { getEncryptedPin } from "@services/security/secure-app-service";
import { showCreatePinAlert } from "@services/util/alert-service";
import * as WebBrowser from "@toruslabs/react-native-web-browser";
import { Constants } from "@utils/constants";
import { EthereumPrivateKeyProvider } from "@web3auth/ethereum-provider";
import Web3Auth, {
  ChainNamespace,
  LOGIN_PROVIDER,
  OPENLOGIN_NETWORK,
} from "@web3auth/react-native-sdk";

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

export const useSetPinWarning = (
  requireFunds: boolean = false,
  navigation?: any
) => {
  const { network } = useReduxSelector("network");
  const { txidVersion } = useReduxSelector("txidVersion");

  const [showCreatePinModal, setShowCreatePinModal] = useState(false);
  const [dismissSetPinWarning, setDismissSetPinWarning] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const currentTxidVersion = txidVersion.current;

  useEffect(() => {
    const init = async () => {
      await web3auth.init();
      if (web3auth.privKey) {
        await ethereumPrivateKeyProvider.setupProvider(web3auth.privKey);
        setLoggedIn(true);
      }
      setIsLoading(false);
    };
    init();
  }, []);

  useEffect(() => {
    const showAlertIfNecessary = async () => {
      if (dismissSetPinWarning || loggedIn || isLoading) {
        return;
      }
      // const storedPin = await getEncryptedPin();
      // if (isDefined(storedPin)) {
      //   setDismissSetPinWarning(true);
      //   return;
      // }
      // const numRemindersStored = await StorageService.getItem(
      //   Constants.NUM_REMINDERS_SET_PIN
      // );
      // const numReminders = isDefined(numRemindersStored)
      //   ? Number(numRemindersStored)
      //   : 0;
      // if (numReminders >= Constants.MAX_REMINDERS_SET_PIN) {
      //   setDismissSetPinWarning(true);
      //   return;
      // }
      if (
        requireFunds &&
        !hasBalancesForNetworkOrRailgun(
          network.current.name,
          currentTxidVersion,
          [
            RailgunWalletBalanceBucket.Spendable,
            RailgunWalletBalanceBucket.ShieldPending,
          ]
        )
      ) {
        return;
      }
      showCreatePinAlert(
        () => {
          setShowCreatePinModal(true);
        },
        async () => {
          // await StorageService.setItem(
          //   Constants.NUM_REMINDERS_SET_PIN,
          //   String(numReminders + 1)
          // );
        }
      );
    };
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    showAlertIfNecessary();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [network, currentTxidVersion, loggedIn, isLoading]);

  if (loggedIn && !isLoading) {
    return {
      dismissSetPinWarning,
      createPinModal: <></>,
    };
  }
  return {
    dismissSetPinWarning,
    createPinModal: (
      <CreatePinModal
        show={showCreatePinModal}
        dismiss={() => setShowCreatePinModal(false)}
        navigation={navigation}
      />
    ),
  };
};
