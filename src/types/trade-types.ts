export interface Trade {
    trade_no: number;
    user_id: string;
    symbol: string;
    volume: number;
    price_open: number;
    price_close: number;
    type: string;
    take_profit: number;
    stop_loss: number;
    profit_amount: number;
    loss_amount: number;
    net_profit: number;
    reason: string;
    mistake: string;
    open_time: string;
    close_time: string;
    strategy?: string;
    session?: string;
    emotion?: string;
    mae?: number;
    mfe?: number;
}
