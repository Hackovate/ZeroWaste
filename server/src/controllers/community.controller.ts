import { Request, Response, NextFunction } from 'express';
import prisma from '../config/database';
import { AuthRequest } from '../middleware/auth';

export const getHelpRequests = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { district, division, category, status, sortBy, page, limit } = req.query;
    
    // Parse pagination
    const pageNumber = page ? parseInt(page as string, 10) : 1;
    const pageSize = limit ? parseInt(limit as string, 10) : 20;
    const skip = (pageNumber - 1) * pageSize;

    // Build where clause
    const where: any = {};
    
    if (category && category !== 'all') {
      where.category = category as string;
    }
    
    if (status && status !== 'all') {
      where.status = status as string;
    }

    // Location filters
    if (district) {
      where.district = district as string;
    }
    
    if (division) {
      where.division = division as string;
    }

    // Get fraud report counts and filter out heavily reported items
    const helpRequests = await prisma.helpRequest.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            imageUrl: true
          }
        },
        donations: {
          select: {
            id: true,
            donorUserId: true,
            anonymous: true,
            createdAt: true
          }
        },
        reports: {
          select: {
            type: true
          }
        },
        _count: {
          select: {
            donations: true,
            reports: true
          }
        }
      },
      orderBy: getSortOrder(sortBy as string),
      skip,
      take: pageSize,
    });

    // Filter out items with 5+ fraud reports
    const filteredRequests = helpRequests
      .map(request => {
        const fraudReports = request.reports.filter(r => r.type === 'fraud').length;
        const trustedReports = request.reports.filter(r => r.type === 'trusted').length;
        
        return {
          ...request,
          fraudReports,
          trustedReports,
          isHidden: fraudReports >= 5
        };
      })
      .filter(request => !request.isHidden)
      .map(({ reports, _count, ...rest }) => rest); // Remove reports array from response

    const total = await prisma.helpRequest.count({ where });
    const totalPages = Math.ceil(total / pageSize);

    res.json({
      success: true,
      data: filteredRequests,
      pagination: {
        page: pageNumber,
        limit: pageSize,
        total,
        totalPages,
        hasNextPage: pageNumber < totalPages,
        hasPreviousPage: pageNumber > 1,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getHelpRequest = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const helpRequest = await prisma.helpRequest.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            imageUrl: true,
            district: true,
            division: true
          }
        },
        donations: {
          include: {
            donor: {
              select: {
                id: true,
                name: true,
                imageUrl: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        },
        reports: {
          select: {
            type: true
          }
        }
      }
    });

    if (!helpRequest) {
      return res.status(404).json({
        success: false,
        error: 'Help request not found'
      });
    }

    // Calculate report counts
    const fraudReports = helpRequest.reports.filter(r => r.type === 'fraud').length;
    const trustedReports = helpRequest.reports.filter(r => r.type === 'trusted').length;

    // Hide if too many fraud reports
    if (fraudReports >= 5) {
      return res.status(404).json({
        success: false,
        error: 'Help request not available'
      });
    }

    const { reports, ...requestData } = helpRequest;

    res.json({
      success: true,
      data: {
        ...requestData,
        fraudReports,
        trustedReports
      }
    });
  } catch (error) {
    next(error);
  }
};

export const createHelpRequest = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const {
      title,
      description,
      category,
      quantity,
      unit,
      district,
      division,
      contactName,
      contactEmail,
      contactPhone,
      neededBy
    } = req.body;

    // Get user's location if not provided
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { district: true, division: true }
    });

    const helpRequest = await prisma.helpRequest.create({
      data: {
        title,
        description,
        category,
        quantity,
        unit,
        district: district || user?.district || 'Not specified',
        division: division || user?.division || 'Not specified',
        contactName,
        contactEmail,
        contactPhone,
        neededBy: new Date(neededBy),
        userId
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            imageUrl: true
          }
        }
      }
    });

    res.status(201).json({
      success: true,
      data: helpRequest
    });
  } catch (error) {
    next(error);
  }
};

export const updateHelpRequest = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const { id } = req.params;

    // Check if user owns this help request
    const existingRequest = await prisma.helpRequest.findUnique({
      where: { id }
    });

    if (!existingRequest) {
      return res.status(404).json({
        success: false,
        error: 'Help request not found'
      });
    }

    if (existingRequest.userId !== userId) {
      return res.status(403).json({
        success: false,
        error: 'You can only update your own help requests'
      });
    }

    const updateData: any = { ...req.body };
    if (updateData.neededBy) {
      updateData.neededBy = new Date(updateData.neededBy);
    }

    const helpRequest = await prisma.helpRequest.update({
      where: { id },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            imageUrl: true
          }
        }
      }
    });

    res.json({
      success: true,
      data: helpRequest
    });
  } catch (error) {
    next(error);
  }
};

export const deleteHelpRequest = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const { id } = req.params;

    // Check if user owns this help request
    const existingRequest = await prisma.helpRequest.findUnique({
      where: { id }
    });

    if (!existingRequest) {
      return res.status(404).json({
        success: false,
        error: 'Help request not found'
      });
    }

    if (existingRequest.userId !== userId) {
      return res.status(403).json({
        success: false,
        error: 'You can only delete your own help requests'
      });
    }

    await prisma.helpRequest.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Help request deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

export const createDonation = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const {
      helpRequestId,
      message,
      quantity,
      unit,
      contactInfo,
      anonymous
    } = req.body;

    // Check if help request exists and is open
    const helpRequest = await prisma.helpRequest.findUnique({
      where: { id: helpRequestId }
    });

    if (!helpRequest) {
      return res.status(404).json({
        success: false,
        error: 'Help request not found'
      });
    }

    if (helpRequest.status === 'closed') {
      return res.status(400).json({
        success: false,
        error: 'This help request is closed'
      });
    }

    const donation = await prisma.donation.create({
      data: {
        helpRequestId,
        donorUserId: userId,
        message,
        quantity,
        unit,
        contactInfo,
        anonymous: anonymous || false
      },
      include: {
        donor: {
          select: {
            id: true,
            name: true,
            imageUrl: true
          }
        }
      }
    });

    res.status(201).json({
      success: true,
      data: donation
    });
  } catch (error) {
    next(error);
  }
};

export const createReport = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const { helpRequestId, type, reason } = req.body;

    // Check if help request exists
    const helpRequest = await prisma.helpRequest.findUnique({
      where: { id: helpRequestId }
    });

    if (!helpRequest) {
      return res.status(404).json({
        success: false,
        error: 'Help request not found'
      });
    }

    // Check if user already reported this request
    const existingReport = await prisma.helpRequestReport.findUnique({
      where: {
        helpRequestId_reporterUserId: {
          helpRequestId,
          reporterUserId: userId
        }
      }
    });

    if (existingReport) {
      return res.status(400).json({
        success: false,
        error: 'You have already reported this help request'
      });
    }

    const report = await prisma.helpRequestReport.create({
      data: {
        helpRequestId,
        reporterUserId: userId,
        type,
        reason
      }
    });

    res.status(201).json({
      success: true,
      data: report
    });
  } catch (error) {
    next(error);
  }
};

// Helper function for sorting
function getSortOrder(sortBy?: string) {
  switch (sortBy) {
    case 'newest':
      return { createdAt: 'desc' as const };
    case 'oldest':
      return { createdAt: 'asc' as const };
    case 'urgent':
      return { neededBy: 'asc' as const };
    default:
      return { createdAt: 'desc' as const };
  }
}
