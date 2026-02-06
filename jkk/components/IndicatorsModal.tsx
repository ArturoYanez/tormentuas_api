
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";

export type Indicator = 
  | "ema" | "sma" | "rsi" | "bbands" | "macd" | "stoch" | "atr" 
  | "ichimoku" | "fib" | "pivot" | "volume" | "vwap" | "sar" 
  | "williams" | "momentum" | "cci";

const indicatorNames: Record<Indicator, string> = {
  ema: "Media Móvil Exponencial (EMA)",
  sma: "Media Móvil Simple (SMA)",
  rsi: "Índice de Fuerza Relativa (RSI)",
  bbands: "Bandas de Bollinger",
  macd: "Convergencia/Divergencia de Medias Móviles (MACD)",
  stoch: "Oscilador Estocástico",
  atr: "Rango Verdadero Promedio (ATR)",
  ichimoku: "Nube de Ichimoku",
  fib: "Retrocesos de Fibonacci",
  pivot: "Puntos de Pivote",
  volume: "Perfil de Volumen",
  vwap: "Precio Promedio Ponderado por Volumen (VWAP)",
  sar: "SAR Parabólico",
  williams: "Williams %R",
  momentum: "Indicador de Momento",
  cci: "Índice de Canal de Materias Primas (CCI)",
};

interface IndicatorsModalProps {
  isOpen: boolean;
  onClose: () => void;
  selected: Indicator[];
  onChange: (indicators: Indicator[]) => void;
}

const IndicatorsModal: React.FC<IndicatorsModalProps> = ({
  isOpen, onClose, selected, onChange
}) => {
  const [active, setActive] = useState<Indicator[]>(selected);

  const toggleIndicator = (ind: Indicator) => {
    setActive((prev) =>
      prev.includes(ind) ? prev.filter(i => i !== ind) : [...prev, ind]
    );
  };

  const handleSave = () => {
    onChange(active);
    onClose();
  };

  React.useEffect(() => {
    if (isOpen) setActive(selected);
  }, [isOpen, selected]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open ? onClose() : undefined}>
      <DialogContent className="max-w-md mx-auto p-0 bg-[#1a1d2e] border-gray-700 text-white">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-center mt-4 mb-2">
            Selecciona Indicadores
          </DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[60vh]">
          <div className="flex flex-col gap-3 px-4">
            {(Object.keys(indicatorNames) as Indicator[]).map((i) => (
              <div key={i} className="flex items-center justify-between gap-2 py-3 border-b border-gray-800/30 last:border-b-0">
                <span className="text-white text-sm font-medium">{indicatorNames[i]}</span>
                <Switch checked={active.includes(i)} onCheckedChange={() => toggleIndicator(i)} />
              </div>
            ))}
          </div>
        </ScrollArea>
        <DialogFooter className="mt-4 px-4 mb-3">
          <Button className="w-full bg-gradient-to-r from-blue-500 to-purple-700" onClick={handleSave}>
            Guardar cambios
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default IndicatorsModal;
