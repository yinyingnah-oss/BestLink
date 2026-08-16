import React, { useState } from "react";
import AdminLayout from "./AdminLayout";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAppContext } from "@/_core/hooks/useAppContext";
import { Store, Save, FileVideo, FileText, Image as ImageIcon } from "lucide-react";

export default function AdminStoreIntro() {
  const { t } = useAppContext();
  const [introText, setIntroText] = useState("欢迎来到我们的商店！我们致力于提供最优质的泰国商品...");
  const [videoUrl, setVideoUrl] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      alert("保存成功 (Saved successfully)");
    }, 1000);
  };

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-stone-800">{t("storeIntro") || "商店介绍"}</h1>
          <p className="text-stone-500 mt-1">设置您店铺的品牌故事和视频介绍，吸引更多顾客。</p>
        </div>

        <Card className="p-6 space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-stone-800 flex items-center gap-2">
              <FileText className="w-5 h-5 text-matcha-600" />
              文字介绍 (Introduction Text)
            </h3>
            <p className="text-sm text-stone-500">向顾客展示您的品牌理念、主营业务和特色服务。</p>
            <textarea 
              value={introText}
              onChange={(e) => setIntroText(e.target.value)}
              className="flex min-h-[150px] w-full rounded-md border border-stone-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-stone-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-matcha-600 focus-visible:ring-offset-2 resize-y"
              placeholder="在这里输入您的商店介绍..."
            ></textarea>
          </div>

          <div className="pt-6 border-t border-stone-100 space-y-4">
            <h3 className="text-lg font-bold text-stone-800 flex items-center gap-2">
              <FileVideo className="w-5 h-5 text-matcha-600" />
              宣传视频 (Promo Video)
            </h3>
            <p className="text-sm text-stone-500">上传视频链接（如 YouTube 或本地视频 URL），视频将展示在您的主页醒目位置。</p>
            <Input 
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="https://youtube.com/..."
            />
            {videoUrl && (
              <div className="mt-4 aspect-video bg-stone-100 rounded-lg overflow-hidden flex items-center justify-center border border-stone-200">
                {/* Dummy video player placeholder */}
                <div className="text-center text-stone-400 flex flex-col items-center">
                  <FileVideo className="w-12 h-12 mb-2 opacity-50" />
                  <span>视频预览区</span>
                </div>
              </div>
            )}
          </div>
          
          <div className="pt-6 border-t border-stone-100 space-y-4">
            <h3 className="text-lg font-bold text-stone-800 flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-matcha-600" />
              图片画廊 (Image Gallery)
            </h3>
            <p className="text-sm text-stone-500">上传您的高质量图片展示商店环境或证书。</p>
            <div className="flex gap-4">
              <div className="w-32 h-32 border-2 border-dashed border-stone-200 rounded-lg flex flex-col items-center justify-center text-stone-400 hover:border-matcha-500 hover:text-matcha-600 cursor-pointer transition-colors bg-stone-50">
                <ImageIcon className="w-6 h-6 mb-2" />
                <span className="text-xs font-medium">点击上传</span>
              </div>
            </div>
          </div>

          <div className="pt-6 flex justify-end">
            <Button 
              className="bg-matcha-600 hover:bg-matcha-700 text-white min-w-[120px]" 
              onClick={handleSave}
              disabled={isSaving}
            >
              {isSaving ? "保存中..." : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  保存设置
                </>
              )}
            </Button>
          </div>
        </Card>
      </div>
    </AdminLayout>
  );
}
