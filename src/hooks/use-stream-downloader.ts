import {
  cancelDownload,
  deleteAllDownloadedAssets,
  deleteDownloadedAsset,
  downloadStream,
  getDownloadedAssets,
  getDownloadsStatus,
  isRegistered,
  pauseDownload,
  registerPlugin,
  resumeDownload,
  useEvent,
  type DownloadedAsset,
  type DownloadOptions,
  type DownloadStatus,
} from "@TheWidlarzGroup/react-native-video-stream-downloader";

import { useEffect, useState } from "react";
import { Platform } from "react-native";

export const useStreamDownloader = (apiKey: string) => {
  const [downloads, setDownloads] = useState<DownloadStatus[]>([]);
  const [assets, setAssets] = useState<DownloadedAsset[]>([]);
  const [loading, setLoading] = useState(true);

  /** 🔹 SDK initialization and fetch initial data */
  useEffect(() => {
    const init = async () => {
      try {
        await registerPlugin(apiKey);

        await Promise.all([refreshDownloads(), refreshAssets()]);
        setLoading(false);
      } catch (error) {
        console.error("Error initializing SDK:", error);
      }
    };
    init();
  }, [apiKey]);

  /** 🔹 Fetch current download status */
  const refreshDownloads = async () => {
    try {
      const current = await getDownloadsStatus();
      setDownloads(current);
      console.log("Current downloads:", current);
    } catch (err) {
      console.error("Failed to get download status:", err);
    }
  };

  /** 🔹 Fetch downloaded assets */
  const refreshAssets = async () => {
    try {
      const downloaded = await getDownloadedAssets();
      setAssets(downloaded);
      console.log("Downloaded assets:", downloaded);
    } catch (err) {
      console.error("Failed to get downloaded assets:", err);
    }
  };

  /** 🔹 SDK events */
  useEvent("onDownloadProgress", async (statuses) => {
    console.log("Download progress event received ", statuses);
    setDownloads((prev) => {
      const updated = [...prev];

      statuses.forEach((status) => {
        if (status.status === "completed") return;

        const index = updated.findIndex((d) => d.id === status.id);
        if (index !== -1) {
          updated[index] = status;
        } else {
          updated.push(status);
        }
      });

      return updated;
    });
  });

  useEvent("onDownloadEnd", async () => {
    console.log("Download end event received");
    await refreshDownloads();
    await refreshAssets();
  });

  async function getDrmToken(assetId: string) {
    /* Here you can generate your custom drm token */

    // const resp = await fetch("https://your-backend.example.com/drm/token", {
    //   method: "POST",
    //   headers: { "Content-Type": "application/json" },
    //   body: JSON.stringify({ userId: "CURRENT_USER_ID", assetId }),
    // });
    // if (!resp.ok) throw new Error("Failed to get DRM token");
    // const json = await resp.json();
    // return json.token as string;

    return "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjI3MDg0Mzc5MDksImtpZCI6WyIqIl0sImR1cmF0aW9uIjoyNTkyMDAwLCJwZXJzaXN0ZW50Ijp0cnVlLCJ3aWRldmluZSI6eyJsaWNlbnNlX2R1cmF0aW9uIjo5OTk5OTk5LCJwbGF5YmFja19kdXJhdGlvbiI6OTk5OTk5OSwicmVudGlhbF9kdXJhdGlvbiI6OTk5OTk5OX0sImZhaXJwbGF5Ijp7InN0b3JhZ2VfZHVyYXRpb24iOjk5OTk5OTksInBsYXliYWNrX2R1cmF0aW9uIjo5OTk5OTk5fSwiaWF0IjoxNzYyMzU3OTA5fQ.re8RdF8nH645qoBWtwdzQlQyDdNoumdAyvcno7XGSn8";
  }

  const getTWGDRMLicense = async (spcString: string, keyUrl: string) => {
    const formData = new FormData();
    formData.append("spc", spcString);

    const fixedLicenseUrl = keyUrl.replace("skd://", "https://");

    try {
      const response = await fetch(
        `${fixedLicenseUrl}&userToken=${TWG_DRM_VIDEO.token}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "multipart/form-data",
            Accept: "application/json",
          },
          body: formData,
        }
      );

      const responseData = await response.json();
      return responseData.ckc;
    } catch (error) {
      console.error("Error fetching license:", error);
      throw error;
    }
  };

  const TWG_DRM_VIDEO = {
    title: "TWG DRM Protected Stream",
    licenseServer:
      Platform.OS === "ios"
        ? "https://thewidlarzgroup.la.drm.cloud/acquire-license/fairplay?brandGuid=559c7a7e-960d-4cd8-9dba-bc4e59890177"
        : "https://thewidlarzgroup.la.drm.cloud/acquire-license/widevine?brandGuid=559c7a7e-960d-4cd8-9dba-bc4e59890177",
    certificateUrl:
      "https://thewidlarzgroup.la.drm.cloud/certificate/fairplay?brandGuid=559c7a7e-960d-4cd8-9dba-bc4e59890177",
    token:
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjI3MDg0Mzc5MDksImtpZCI6WyIqIl0sImR1cmF0aW9uIjoyNTkyMDAwLCJwZXJzaXN0ZW50Ijp0cnVlLCJ3aWRldmluZSI6eyJsaWNlbnNlX2R1cmF0aW9uIjo5OTk5OTk5LCJwbGF5YmFja19kdXJhdGlvbiI6OTk5OTk5OSwicmVudGlhbF9kdXJhdGlvbiI6OTk5OTk5OX0sImZhaXJwbGF5Ijp7InN0b3JhZ2VfZHVyYXRpb24iOjk5OTk5OTksInBsYXliYWNrX2R1cmF0aW9uIjo5OTk5OTk5fSwiaWF0IjoxNzYyMzU3OTA5fQ.re8RdF8nH645qoBWtwdzQlQyDdNoumdAyvcno7XGSn8",
    headers: {
      get "x-drm-userToken"() {
        return TWG_DRM_VIDEO.token;
      },
    },
    getLicense: getTWGDRMLicense,
  };

  /** 🔹 Start download */
  const start = async (
    url: string,
    config?: DownloadOptions,
    isDrm: boolean = false
  ) => {
    if (isDrm) {
      const url =
        Platform.OS === "ios"
          ? "https://d2e67eijd6imrw.cloudfront.net/559c7a7e-960d-4cd8-9dba-bc4e59890177/assets/47cfca69-91b5-4311-bf6c-b9b1f297ed9b/videokit-720p-dash-hls-drm/hls/index.m3u8"
          : "https://d2e67eijd6imrw.cloudfront.net/559c7a7e-960d-4cd8-9dba-bc4e59890177/assets/47cfca69-91b5-4311-bf6c-b9b1f297ed9b/videokit-720p-dash-hls-drm/dash/index.mpd";

      const drmConfig = {
        licenseServer:
          Platform.OS === "ios"
            ? "https://thewidlarzgroup.la.drm.cloud/acquire-license/fairplay?brandGuid=559c7a7e-960d-4cd8-9dba-bc4e59890177"
            : "https://thewidlarzgroup.la.drm.cloud/acquire-license/widevine?brandGuid=559c7a7e-960d-4cd8-9dba-bc4e59890177",
        certificateUrl:
          "https://thewidlarzgroup.la.drm.cloud/certificate/fairplay?brandGuid=559c7a7e-960d-4cd8-9dba-bc4e59890177",

        token:
          "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjI3MDg0Mzc5MDksImtpZCI6WyIqIl0sImR1cmF0aW9uIjoyNTkyMDAwLCJwZXJzaXN0ZW50Ijp0cnVlLCJ3aWRldmluZSI6eyJsaWNlbnNlX2R1cmF0aW9uIjo5OTk5OTk5LCJwbGF5YmFja19kdXJhdGlvbiI6OTk5OTk5OSwicmVudGlhbF9kdXJhdGlvbiI6OTk5OTk5OX0sImZhaXJwbGF5Ijp7InN0b3JhZ2VfZHVyYXRpb24iOjk5OTk5OTksInBsYXliYWNrX2R1cmF0aW9uIjo5OTk5OTk5fSwiaWF0IjoxNzYyMzU3OTA5fQ.re8RdF8nH645qoBWtwdzQlQyDdNoumdAyvcno7XGSn8",
        headers: {
          get "x-drm-userToken"() {
            return TWG_DRM_VIDEO.token;
          },
        },
        getLicense: getTWGDRMLicense,
      };

      console.log("Starting download for URL with DRM:", url);

      const status = await downloadStream(url, {
        drm: drmConfig,
      });

      console.log("Download started with status:", status);

      await refreshDownloads();

      return status.id;
    } else {
      console.log("Starting download for URL:", url);

      const status = await downloadStream(url, config);

      console.log("Download started with status:", status);

      await refreshDownloads();
      return status.id;
    }
  };

  /** 🔹 Delete single asset */
  const deleteAsset = async (id: string) => {
    console.log("Deleting asset with ID:", id);
    await deleteDownloadedAsset(id);
    console.log("Asset deleted");
    await Promise.all([refreshAssets(), refreshDownloads()]);
  };

  /** 🔹 Delete all assets */
  const clearAll = async () => {
    await deleteAllDownloadedAssets();
    await refreshAssets();
  };

  return {
    loading,
    downloads,
    assets,
    start,
    pauseDownload,
    resumeDownload,
    cancelDownload,
    deleteAsset,
    clearAll,
    refreshDownloads,
    refreshAssets,
    getAssetList: async () => await getDownloadedAssets(),
    isRegistered,
  };
};
