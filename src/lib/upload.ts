import { supabase } from "./supabase";

export async function uploadImage(file: File) {

  if (!file) throw new Error("File tidak ditemukan");

  const fileExt = file.name.split(".").pop();

  const fileName = `${Date.now()}-${Math.random()

    .toString(36)

    .substring(2)}.${fileExt}`;

  const { data, error } = await supabase.storage

    .from("media")

    .upload(fileName, file, {

      cacheControl: "3600",

      upsert: false,

      contentType: file.type,

    });

  console.log("UPLOAD DATA:", data);

  console.log("UPLOAD ERROR:", error);

  if (error) {

    throw new Error(error.message);

  }

  const { data: publicUrlData } = supabase.storage

    .from("media")

    .getPublicUrl(fileName);

  return publicUrlData.publicUrl;

}
