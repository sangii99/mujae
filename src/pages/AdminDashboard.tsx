import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Badge } from "../components/ui/badge";
import { useNavigate } from "react-router";
import { CheckCircle, XCircle } from "lucide-react";
import { Report } from "../types";

interface EnhancedReport {
  id: string;
  reportType: "story" | "user";
  reportedItemId: string;
  reportedBy: string;
  reportedByName: string;
  reason: string;
  details?: string;
  createdAt: Date;
  status: "pending" | "resolved" | "dismissed";
  storyContent?: string;
  storyAuthorName?: string;
  reportedUserName?: string;
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [reports, setReports] = useState<EnhancedReport[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAdmin();
    fetchReports();
  }, []);

  const checkAdmin = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/");
      return;
    }
  };

  const fetchReports = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('reports')
        .select(`
          *,
          reporter:reported_by (nickname)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (!data) {
          setReports([]);
          return;
      }

      // Enhance reports with reported item details
      const enhancedReports = await Promise.all(data.map(async (report: any) => {
        let storyContent, storyAuthorName, reportedUserName;

        if (report.report_type === 'story') {
          const { data: story } = await supabase
            .from('stories')
            .select('content, user_id')
            .eq('id', report.reported_item_id)
            .single();
            
          if(story) {
             storyContent = story.content;
             const { data: author } = await supabase
                .from('profiles')
                .select('nickname')
                .eq('id', story.user_id)
                .single();
             storyAuthorName = author?.nickname;
          }
          
        } else if (report.report_type === 'user') {
            const { data: user } = await supabase
            .from('profiles')
            .select('nickname')
            .eq('id', report.reported_item_id)
            .single();
            reportedUserName = user?.nickname;
        }

        return {
          id: report.id,
          reportType: report.report_type,
          reportedItemId: report.reported_item_id,
          reportedBy: report.reported_by,
          reportedByName: report.reporter?.nickname || '알 수 없음',
          reason: report.reason,
          details: report.details,
          createdAt: new Date(report.created_at),
          status: report.status,
          storyContent,
          storyAuthorName,
          reportedUserName
        };
      }));

      setReports(enhancedReports);
    } catch (error) {
      console.error("Error fetching reports:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (reportId: string, newStatus: 'resolved' | 'dismissed') => {
    try {
      const { error } = await supabase
        .from('reports')
        .update({ status: newStatus })
        .eq('id', reportId);

      if (error) throw error;
      
      setReports(prev => prev.map(r => r.id === reportId ? { ...r, status: newStatus } : r));
    } catch (error) {
      console.error("Error updating report status:", error);
    }
  };

  const pendingReports = reports.filter(r => r.status === 'pending');
  const resolvedReports = reports.filter(r => r.status === 'resolved');
  const dismissedReports = reports.filter(r => r.status === 'dismissed');

  if (loading) return <div className="p-8 text-center">로딩 중...</div>;

  return (
    <div className="container mx-auto p-4 max-w-5xl">
      <h1 className="text-3xl font-bold mb-6">관리자 대시보드 (신고 관리)</h1>
      
      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="pending">대기 중 ({pendingReports.length})</TabsTrigger>
          <TabsTrigger value="resolved">처리 완료 ({resolvedReports.length})</TabsTrigger>
          <TabsTrigger value="dismissed">반려됨 ({dismissedReports.length})</TabsTrigger>
        </TabsList>

        {["pending", "resolved", "dismissed"].map((status) => {
            const currentReports = status === "pending" ? pendingReports : status === "resolved" ? resolvedReports : dismissedReports;
            return (
            <TabsContent key={status} value={status}>
              <div className="grid gap-4">
                {currentReports.map(report => (
                  <Card key={report.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg flex items-center gap-2">
                             {report.reportType === 'story' ? '게시글 신고' : '사용자 신고'}
                             <Badge variant={report.reportType === 'story' ? "outline" : "secondary"}>
                                {report.reason}
                             </Badge>
                          </CardTitle>
                          <CardDescription>
                            신고자: {report.reportedByName} | {report.createdAt.toLocaleString()}
                          </CardDescription>
                        </div>
                        {status === 'pending' && (
                            <div className="flex gap-2">
                                <Button size="sm" variant="outline" className="text-green-600 border-green-600 hover:bg-green-50" onClick={() => handleUpdateStatus(report.id, 'resolved')}>
                                    <CheckCircle className="w-4 h-4 mr-1"/> 처리
                                </Button>
                                <Button size="sm" variant="outline" className="text-gray-500 hover:bg-gray-100" onClick={() => handleUpdateStatus(report.id, 'dismissed')}>
                                    <XCircle className="w-4 h-4 mr-1"/> 반려
                                </Button>
                            </div>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                        {report.reportType === 'story' ? (
                            <div className="bg-muted p-3 rounded-md mb-2">
                                <p className="font-semibold text-sm mb-1">신고된 게시글 (작성자: {report.storyAuthorName})</p>
                                <p className="text-sm text-foreground/80">{report.storyContent || "(삭제된 게시글입니다)"}</p>
                            </div>
                        ) : (
                             <div className="bg-muted p-3 rounded-md mb-2">
                                <p className="font-semibold text-sm mb-1">신고된 사용자</p>
                                <p className="text-sm text-foreground/80">{report.reportedUserName || "(삭제된 사용자입니다)"}</p>
                            </div>
                        )}
                        {report.details && (
                            <div className="mt-2">
                                <span className="font-semibold text-xs text-muted-foreground">상세 내용: </span>
                                <span className="text-sm">{report.details}</span>
                            </div>
                        )}
                    </CardContent>
                  </Card>
                ))}
                {currentReports.length === 0 && (
                    <div className="text-center py-10 text-muted-foreground bg-muted/20 rounded-lg">목록이 비어있습니다.</div>
                )}
              </div>
            </TabsContent>
        )})}
      </Tabs>
    </div>
  );
}
