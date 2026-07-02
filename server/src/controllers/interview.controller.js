import { InterviewService } from "../services/interview.service.js";
import { ReportService } from "../services/report.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const startInterview = asyncHandler(async (req, res) => {
  const { type, difficulty, duration } = req.body;
  const result = await InterviewService.startInterview(
    req.user.userId,
    type,
    difficulty || "INTERMEDIATE",
    duration || 1800,
  );

  res.status(201).json({
    success: true,
    message: "Interview session started",
    data: result,
  });
});

export const endInterview = asyncHandler(async (req, res) => {
  const { sessionId, vapiCallId, transcript } = req.body;
  const result = await InterviewService.endInterview(
    sessionId,
    req.user.userId,
    vapiCallId,
    transcript,
  );

  res.json({
    success: true,
    message: "Interview ended",
    data: result,
  });
});

export const saveMessage = asyncHandler(async (req, res) => {
  const { sessionId, role, content } = req.body;
  const message = await InterviewService.saveMessage(sessionId, role, content);

  res.status(201).json({
    success: true,
    data: message,
  });
});

export const getHistory = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const search = req.query.search;

  const result = await InterviewService.getHistory(
    req.user.userId,
    page,
    limit,
    search,
  );

  res.json({
    success: true,
    data: result,
  });
});

export const getSession = asyncHandler(async (req, res) => {
  const result = await InterviewService.getSession(
    req.params.id,
    req.user.userId,
  );

  res.json({
    success: true,
    data: result,
  });
});

export const deleteSession = asyncHandler(async (req, res) => {
  await InterviewService.deleteSession(req.params.id, req.user.userId);

  res.json({
    success: true,
    message: "Session deleted",
  });
});

export const generateReport = asyncHandler(async (req, res) => {
  const report = await ReportService.generateReport(
    req.params.id,
    req.user.userId,
  );

  res.json({
    success: true,
    data: report,
  });
});

export const getReport = asyncHandler(async (req, res) => {
  const report = await ReportService.getReport(req.params.id, req.user.userId);

  res.json({
    success: true,
    data: report,
  });
});
