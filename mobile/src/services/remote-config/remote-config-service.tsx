import { isDefined } from "@railgun-community/shared-models";
import * as fs from "react-native-fs";
import {
  AppDispatch,
  getLocalRemoteConfigDevOnly,
  getRemoteConfigPath,
  logDevError,
  ReactConfig,
  RemoteConfig,
  setRemoteConfig,
} from "@react-shared";
import { Constants } from "@utils/constants";
import { downloadFailed } from "@utils/downloads";
import { fileExists } from "../util/fs-service";

export class RemoteConfigService {
  dispatch: AppDispatch;

  constructor(dispatch: AppDispatch) {
    this.dispatch = dispatch;
  }

  private async downloadConfig(): Promise<string | undefined> {
    const path = this.getPath();

    try {
      const result = await fs.downloadFile({
        fromUrl: getRemoteConfigPath(),
        toFile: path,
        background: true,
        cacheable: false,
      }).promise;

      if (downloadFailed(result.statusCode)) {
        throw new Error();
      }
      return path;
    } catch (err) {
      logDevError(
        new Error("Could not download remote config", { cause: err })
      );
      if (await fileExists(path)) {
        return path;
      }
      return undefined;
    }
  }

  getPath() {
    return `${fs.DocumentDirectoryPath}/remote-config.json`;
  }

  private useLocalConfigDevOnly() {
    const config = getLocalRemoteConfigDevOnly();
    this.dispatch(setRemoteConfig(config));
    return config;
  }

  async getRemoteConfig(): Promise<RemoteConfig> {
    if (
      (ReactConfig.IS_DEV || isDefined(process.env.test)) &&
      Constants.USE_LOCAL_REMOTE_CONFIG_IN_DEV
    ) {
      return this.useLocalConfigDevOnly();
    }

    const path = await this.downloadConfig();
    if (!isDefined(path)) {
      throw new Error(
        "Could not download resources. Please check your network connection."
      );
    }

    try {
      const data: string = await fs.readFile(path);
      const config: RemoteConfig = JSON.parse(data);

      const configFake = {
        minVersionNumberIOS: "5.5.0",
        minVersionNumberAndroid: "5.5.0",
        minVersionNumberWeb: "5.16.10",
        "bootstrapPeers-": [],
        wakuPubSubTopic: "/waku/2/railgun-broadcaster",
        additionalDirectPeers: [
          "/dns4/waku.wecamefromapes.com/tcp/8000/wss/p2p/16Uiu2HAmATh6oki7ZCQEpCH2P9A1A2UXSRdVuU1hn9mzR3NKarPN",
          "/dns4/zebra.horsewithsixlegs.xyz/tcp/8000/wss/p2p/16Uiu2HAm4LeP19jWXhQ6ayMX27vPYKGAo3WQeeFYrVDJ2nBi9gjv",
          "/dns4/giraffe.horsewithsixlegs.xyz/tcp/8000/wss/p2p/16Uiu2HAm6EBg9G12QTbL4UbRGgRW7GnWzAghCZskgwahtPUT1Fvf",
        ],
        wakuPeerDiscoveryTimeout: 60000,
        pollingInterval: 30000,
        proxyApiUrl: "https://uber.us.proxy.railwayapi.xyz",
        proxyNftsApiUrl: "https://nfts.us.proxy.railwayapi.xyz",
        proxyPoiAggregatorUrl: "https://poi.us.proxy.railwayapi.xyz",
        publicPoiAggregatorUrls: ["https://poi-node.terminal-wallet.com/"],
        poiDocumentation: {
          railgunPOIDocUrl:
            "https://docs.railgun.org/wiki/assurance/private-proofs-of-innocence",
          railwayPOIDocUrl:
            "https://help.railway.xyz/private-proofs-of-innocence",
        },
        defaultNetworkName: "Ethereum",
        availableNetworks: {
          Ethereum: {
            canSendPublic: true,
            canSendShielded: true,
            canShield: true,
            canUnshield: true,
            canSwapPublic: true,
            canSwapShielded: true,
            canRelayAdapt: true,
          },
          BNB_Chain: {
            canSendPublic: true,
            canSendShielded: true,
            canShield: true,
            canUnshield: true,
            canSwapPublic: true,
            canSwapShielded: true,
            canRelayAdapt: true,
          },
          Polygon: {
            canSendPublic: true,
            canSendShielded: true,
            canShield: true,
            canUnshield: true,
            canSwapPublic: true,
            canSwapShielded: true,
            canRelayAdapt: true,
          },
          Arbitrum: {
            canSendPublic: true,
            canSendShielded: true,
            canShield: true,
            canUnshield: true,
            canSwapPublic: true,
            canSwapShielded: true,
            canRelayAdapt: true,
          },
          Ethereum_Sepolia: {
            canSendPublic: true,
            canSendShielded: true,
            canShield: true,
            canUnshield: true,
            canSwapPublic: false,
            canSwapShielded: false,
            canRelayAdapt: true,
          },
          Hardhat: {
            canSendPublic: true,
            canSendShielded: true,
            canShield: true,
            canUnshield: true,
            canSwapPublic: true,
            canSwapShielded: true,
            canRelayAdapt: true,
            isDevOnly: true,
          },
          QDayTestNet: {
            canSendPublic: true,
            canSendShielded: true,
            canShield: true,
            canUnshield: true,
            canSwapPublic: true,
            canSwapShielded: true,
            canRelayAdapt: true,
            isDevOnly: true,
          },
        },
        networkProvidersConfig: {
          Ethereum: {
            chainId: 1,
            providers: [
              {
                provider:
                  "https://uber.us.proxy.railwayapi.xyz/rpc/alchemy/eth-mainnet",
                priority: 1,
                weight: 2,
                maxLogsPerBatch: 2,
                stallTimeout: 2500,
              },
              {
                provider: "https://ethereum-rpc.publicnode.com",
                priority: 2,
                weight: 2,
                maxLogsPerBatch: 10,
              },
              {
                provider: "https://rpc.ankr.com/eth",
                priority: 3,
                weight: 2,
                maxLogsPerBatch: 10,
              },
            ],
          },
          BNB_Chain: {
            chainId: 56,
            providers: [
              {
                provider: "https://bsc-rpc.publicnode.com",
                priority: 1,
                weight: 2,
                maxLogsPerBatch: 10,
                stallTimeout: 2500,
              },
              {
                provider: "https://bsc-dataseed.binance.org",
                priority: 1,
                weight: 2,
                maxLogsPerBatch: 10,
                stallTimeout: 2500,
              },
              {
                provider: "https://bsc-dataseed1.defibit.io",
                priority: 2,
                weight: 2,
                maxLogsPerBatch: 10,
              },
              {
                provider: "https://bsc-dataseed1.ninicoin.io",
                priority: 3,
                weight: 2,
                maxLogsPerBatch: 10,
              },
            ],
          },
          Ethereum_Sepolia: {
            chainId: 11155111,
            providers: [
              {
                provider:
                  "https://uber.us.proxy.railwayapi.xyz/rpc/alchemy/eth-sepolia",
                priority: 1,
                weight: 2,
                maxLogsPerBatch: 2,
                stallTimeout: 2500,
              },
              {
                provider: "https://ethereum-sepolia-rpc.publicnode.com",
                priority: 2,
                weight: 2,
                maxLogsPerBatch: 10,
              },
              {
                provider:
                  "https://ethereum-sepolia.blockpi.network/v1/rpc/public",
                priority: 2,
                weight: 2,
                maxLogsPerBatch: 10,
              },
              {
                provider: "https://rpc.ankr.com/eth_sepolia",
                priority: 3,
                weight: 2,
                maxLogsPerBatch: 10,
              },
            ],
          },
          Polygon: {
            chainId: 137,
            providers: [
              {
                provider:
                  "https://uber.us.proxy.railwayapi.xyz/rpc/alchemy/polygon-mainnet",
                priority: 1,
                weight: 2,
                maxLogsPerBatch: 2,
                stallTimeout: 2500,
              },
              {
                provider: "https://polygon-bor-rpc.publicnode.com",
                priority: 2,
                weight: 1,
                maxLogsPerBatch: 10,
              },
              {
                provider: "https://rpc.ankr.com/polygon",
                priority: 3,
                weight: 1,
                maxLogsPerBatch: 10,
              },
            ],
          },
          Hardhat: {
            chainId: 31337,
            providers: [
              {
                provider: "http://127.0.0.1:8545",
                priority: 1,
                weight: 2,
                stallTimeout: 2500,
              },
            ],
          },
          Arbitrum: {
            chainId: 42161,
            providers: [
              {
                provider: "https://arb1.arbitrum.io/rpc",
                priority: 1,
                weight: 2,
                stallTimeout: 2500,
              },
              {
                provider:
                  "https://uber.us.proxy.railwayapi.xyz/rpc/alchemy/arb-mainnet",
                priority: 2,
                weight: 2,
                maxLogsPerBatch: 2,
              },
              {
                provider: "https://arbitrum-one-rpc.publicnode.com",
                priority: 3,
                weight: 2,
                maxLogsPerBatch: 10,
              },
              {
                provider: "https://rpc.ankr.com/arbitrum",
                priority: 4,
                weight: 2,
                maxLogsPerBatch: 10,
              },
            ],
          },
          QDayTestNet: {
            chainId: 1001,
            providers: [
              {
                provider: "https://devnet-rpc.qday.ninja",
                priority: 1,
                weight: 2,
                maxLogsPerBatch: 2,
                stallTimeout: 2500,
              },
            ],
          },
        },
        networkProvidersConfigArchiveNodes: {},
      };

      this.dispatch(setRemoteConfig(configFake));
      return configFake;
    } catch (err) {
      logDevError(
        new Error("Could not parse resource files", {
          cause: err,
        })
      );
      throw new Error(
        `Could not parse resource files. Please try again later.`
      );
    }
  }
}
