
import React, { useEffect, useState } from "react";
import api from "@/lib/api";
import { toast } from "@/hooks/use-toast";

const ExampleApiUsage = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Ejemplo básico de GET a un endpoint real
    setLoading(true);
    api.get("/posts/1")
      .then((response) => setData(response.data))
      .catch((error) => {
        toast({
          title: "API error",
          description: error.message || "Error fetching data",
          variant: "destructive",
        });
      })
      .finally(() => setLoading(false));
  }, []);

  const handlePost = async () => {
    setLoading(true);
    try {
      const response = await api.post("/posts", { title: "foo", body: "bar", userId: 1 });
      setData(response.data);
      toast({
        title: "POST exitoso",
        description: "Datos enviados a JSONPlaceholder (simulado).",
      });
    } catch (error: any) {
      toast({
        title: "POST error",
        description: error.message || "No se pudo enviar información",
        variant: "destructive",
      });
    }
    setLoading(false);
  };

  return (
    <div className="py-8 max-w-xl mx-auto flex flex-col gap-4 items-center">
      <h2 className="font-bold text-2xl text-blue-300">Ejemplo de API con axios</h2>
      <button
        onClick={handlePost}
        className="px-6 py-2 rounded bg-gradient-to-r from-fuchsia-600 to-blue-600 text-white font-bold shadow"
        disabled={loading}
      >
        Enviar POST de ejemplo
      </button>
      <div className="bg-gray-900 rounded px-4 py-2 w-full mt-4 text-sm text-green-200">
        <pre className="whitespace-pre-wrap">{loading ? "Cargando..." : JSON.stringify(data, null, 2)}</pre>
      </div>
    </div>
  );
};
export default ExampleApiUsage;
