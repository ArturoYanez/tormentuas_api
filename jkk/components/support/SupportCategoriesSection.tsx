
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText } from "lucide-react";
import { supportCategories } from "./constants";

const SupportCategoriesSection = () => (
  <Card className="bg-gradient-to-br from-[#1e2139] via-[#2a2d47] to-[#1e2139] border-0 mb-12 overflow-hidden relative backdrop-blur-sm">
    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5"></div>
    <CardHeader className="relative z-10">
      <CardTitle className="text-white flex items-center gap-3 text-2xl">
        <FileText className="w-7 h-7 text-blue-400" />
        Categorías de Soporte Especializado
      </CardTitle>
    </CardHeader>
    <CardContent className="relative z-10">
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {supportCategories.map((category) => (
          <div key={category.id} className="bg-gradient-to-br from-slate-700/30 to-slate-800/30 border border-slate-600/50 rounded-xl p-4 hover:scale-105 transition-all duration-300 cursor-pointer group">
            <div className="text-center">
              <div className="text-3xl mb-2 group-hover:scale-110 transition-transform duration-300">{category.icon}</div>
              <h4 className={`font-bold text-sm ${category.color} mb-1`}>{category.name}</h4>
              <div className="w-full h-1 bg-gradient-to-r from-transparent via-current to-transparent opacity-50 rounded-full"></div>
            </div>
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
);

export default SupportCategoriesSection;
