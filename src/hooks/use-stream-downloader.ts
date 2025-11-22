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
  useEvent('onDownloadProgress', async (statuses) => {
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

  const TWG_DRM_VIDEO_TOKEN =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE5ODQ0MjQ3ODcsImtpZCI6WyIqIl0sImR1cmF0aW9uIjo2MDQ4MDAsInBlcnNpc3RlbnQiOnRydWUsIndpZGV2aW5lIjp7ImxpY2Vuc2VfZHVyYXRpb24iOjk5OTk5OTksInBsYXliYWNrX2R1cmF0aW9uIjo5OTk5OTk5LCJyZW50aWFsX2R1cmF0aW9uIjo5OTk5OTk5fSwiZmFpcnBsYXkiOnsic3RvcmFnZV9kdXJhdGlvbiI6OTk5OTk5OSwicGxheWJhY2tfZHVyYXRpb24iOjk5OTk5OTl9LCJpYXQiOjE3NjM2NzI3ODd9.3QUrjjsVcqTBrBpOfJPL8hygBb-de_vZlN0L6jcN3dQ";

  // iOS FairPlay license callback
  const getTWGDRMLicense = async (spcString: string, keyUrl: string) => {
    const formData = new FormData();
    formData.append("spc", spcString);

    const fixedLicenseUrl = keyUrl.replace("skd://", "https://");

    try {
      const response = await fetch(
        `${fixedLicenseUrl}&userToken=${TWG_DRM_VIDEO_TOKEN}`,
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

  /** 🔹 Start download */
  const start = async (
    url: string,
    config?: DownloadOptions,
    isDrm: boolean = false,
    licenseServer?: string,
    certificateUrl?: string
  ) => {
    if (isDrm) {
      console.log("Starting download for URL with DRM:", url);

      const status = await downloadStream(url, {
        drm: {
          licenseServer: licenseServer,
          certificateUrl: certificateUrl,
          headers: { "x-drm-userToken": TWG_DRM_VIDEO_TOKEN },
          ...(Platform.OS === "ios" ? { getLicense: getTWGDRMLicense } : {}),
        },
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
