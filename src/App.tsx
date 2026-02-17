import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HelmetProvider } from "react-helmet-async";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import ArticleDetail from "./pages/ArticleDetail";
import CategoryPage from "./pages/CategoryPage";
import SearchPage from "./pages/SearchPage";
import AboutPage from "./pages/AboutPage";
import VideoPage from "./pages/VideoPage";
import NotFound from "./pages/NotFound";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AuthorPage from "./pages/AuthorPage";
import TagPage from "./pages/TagPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <HelmetProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/berita/:slug" element={<ArticleDetail />} />
            <Route path="/kategori/:id" element={<CategoryPage />} />
            <Route path="/cari" element={<SearchPage />} />
            <Route path="/penulis/:name" element={<AuthorPage />} />
            <Route path="/tag/:slug" element={<TagPage />} />
            <Route path="/tentang" element={<AboutPage />} />
            <Route path="/video" element={<VideoPage />} />
            <Route path="/video/:id" element={<VideoPage />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/editor/login" element={<AdminLogin />} />
            <Route path="/editor" element={<AdminDashboard />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </HelmetProvider>
  </QueryClientProvider>
);

export default App;
