import React, { useState, useEffect } from "react";
import AdminLayout from "@/components/layout/AdminLayout";
import {
    DollarSign,
    Users,
    TrendingUp,
    Download,
    Filter,
    Calendar as CalendarIcon,
    Search
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import api from "@/lib/api";
import { toast } from "@/hooks/use-toast";

const Sales = () => {
    const [analytics, setAnalytics] = useState<any>(null);
    const [transactions, setTransactions] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState("all");

    useEffect(() => {
        fetchData();
    }, [statusFilter]);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [analyticsRes, transactionsRes] = await Promise.all([
                api.get("/api/subscriptions/admin/sales/analytics"),
                api.get(`/api/subscriptions/admin/sales/transactions${statusFilter !== 'all' ? `?status=${statusFilter}` : ''}`)
            ]);
            setAnalytics(analyticsRes.data);
            setTransactions(transactionsRes.data);
        } catch (error) {
            console.error("Error fetching sales data:", error);
            toast({
                title: "Error",
                description: "Failed to load sales data.",
                variant: "destructive"
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleDownloadInvoice = async (txId: string, invoiceNum: string) => {
        try {
            const response = await api.get(`/api/subscriptions/transactions/${txId}/invoice`, {
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `invoice_${invoiceNum}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error("Error downloading invoice:", error);
            toast({
                title: "Download Failed",
                description: "Could not download invoice.",
                variant: "destructive"
            });
        }
    };

    return (
        <AdminLayout>
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold">Sales & Revenue</h1>
                    <p className="text-muted-foreground">Monitor subscriptions and financial performance.</p>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                            <DollarSign className="h-4 w-4 text-primary" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">${analytics?.total_revenue?.toLocaleString() || '0'}</div>
                            <p className="text-xs text-muted-foreground">+20.1% from last month</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Active Subscribers</CardTitle>
                            <Users className="h-4 w-4 text-emerald-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{analytics?.active_subscribers || '0'}</div>
                            <p className="text-xs text-muted-foreground">Premium users currently active</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
                            <TrendingUp className="h-4 w-4 text-blue-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">${analytics?.monthly_revenue?.toLocaleString() || '0'}</div>
                            <p className="text-xs text-muted-foreground">Current month projected</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">Total transactions</CardTitle>
                            <TrendingUp className="h-4 w-4 text-orange-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{transactions.length}</div>
                            <p className="text-xs text-muted-foreground">Lifetime transaction count</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters & Table */}
                <div className="glass-card p-6">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                        <div className="relative w-full md:w-72">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="Search user or invoice..." className="pl-9" />
                        </div>
                        <div className="flex items-center gap-2 w-full md:w-auto">
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Status</SelectItem>
                                    <SelectItem value="paid">Paid</SelectItem>
                                    <SelectItem value="pending">Pending</SelectItem>
                                    <SelectItem value="failed">Failed</SelectItem>
                                </SelectContent>
                            </Select>
                            <Button variant="outline" size="icon">
                                <Filter className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>

                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Invoice #</TableHead>
                                    <TableHead>User</TableHead>
                                    <TableHead>Plan</TableHead>
                                    <TableHead>Amount</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center py-10">Loading transactions...</TableCell>
                                    </TableRow>
                                ) : transactions.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center py-10">No transactions found.</TableCell>
                                    </TableRow>
                                ) : (
                                    transactions.map((tx) => (
                                        <TableRow key={tx.id}>
                                            <TableCell className="font-medium">{tx.invoice_number}</TableCell>
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span>{tx.billing_details?.full_name}</span>
                                                    <span className="text-xs text-muted-foreground">{tx.billing_details?.email}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="capitalize">{tx.billing_details?.plan_name}</TableCell>
                                            <TableCell>${tx.total_amount?.toFixed(2)}</TableCell>
                                            <TableCell>{new Date(tx.payment_date).toLocaleDateString()}</TableCell>
                                            <TableCell>
                                                <Badge variant={tx.status === 'paid' ? 'outline' : tx.status === 'failed' ? 'destructive' : 'secondary'} className={tx.status === 'paid' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : ''}>
                                                    {tx.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleDownloadInvoice(tx.id, tx.invoice_number)}
                                                >
                                                    <Download className="h-4 w-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};

export default Sales;
