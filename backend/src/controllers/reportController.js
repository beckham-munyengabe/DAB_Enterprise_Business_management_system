import ReportModel from "../models/reportModel.js";

export async function dashboard(_req, res, next) {
  try {
    res.json(await ReportModel.dashboard());
  } catch (err) {
    next(err);
  }
}

export async function dailyRevenue(req, res, next) {
  try {
    const days = Number(req.query.days) || 14;
    res.json(await ReportModel.dailyRevenue(days));
  } catch (err) {
    next(err);
  }
}

export async function monthlyRevenue(_req, res, next) {
  try {
    res.json(await ReportModel.monthlyRevenue());
  } catch (err) {
    next(err);
  }
}

export async function topCustomers(req, res, next) {
  try {
    const limit = Number(req.query.limit) || 5;
    res.json(await ReportModel.topCustomers(limit));
  } catch (err) {
    next(err);
  }
}

export async function stockReport(_req, res, next) {
  try {
    res.json(await ReportModel.stockReport());
  } catch (err) {
    next(err);
  }
}
