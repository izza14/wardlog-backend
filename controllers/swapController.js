const SwapRequest = require('../models/SwapRequest');

// POST /api/swap-requests (Staff submit requests)[cite: 1]
exports.createSwapRequest = async (req, res, next) => {
  try {
    const { shift, swapWith, requestedDate, reason } = req.body;
    const newRequest = await SwapRequest.create({
      requester: req.user.id,
      shift,
      swapWith,
      requestedDate,
      reason
    });
    res.status(201).json({ success: true, data: newRequest, message: 'Swap request submitted' });
  } catch (error) {
    error.status = 400;
    next(error);
  }
};

// PUT /api/swap-requests/:id/approve (Admin only)[cite: 1]
exports.approveSwap = async (req, res, next) => {
  try {
    const request = await SwapRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ success: false, data: null, message: 'Request not found' });

    request.status = 'Approved';
    await request.save();
    
    // Note: Here you would ideally also update the Roster model to reflect the swap
    res.status(200).json({ success: true, data: request, message: 'Shift swap approved' });
  } catch (error) {
    next(error);
  }
};

// GET /api/swap-requests
exports.getSwapRequests = async (req, res, next) => {
  try {
    const requests = await SwapRequest.find()
      .populate('requester', 'name role')
      .populate('swapWith', 'name role')
      .sort({ requestedDate: 1 });
    res.status(200).json({ success: true, data: requests, message: 'Swap requests retrieved' });
  } catch (error) {
    next(error);
  }
};

// PUT /api/swap-requests/:id/reject (Admin only)
exports.rejectSwap = async (req, res, next) => {
  try {
    const request = await SwapRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ success: false, data: null, message: 'Request not found' });

    request.status = 'Rejected';
    await request.save();
    
    res.status(200).json({ success: true, data: request, message: 'Shift swap rejected' });
  } catch (error) {
    next(error);
  }
};