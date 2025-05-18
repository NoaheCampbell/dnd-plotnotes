import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

// GET /api/campaigns/[id]/flowcharts - List flowcharts for a campaign
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const campaignId = parseInt(params.id);
    if (isNaN(campaignId)) {
      return NextResponse.json({ error: 'Invalid campaign ID' }, { status: 400 });
    }

    const flowcharts = await prisma.flowchart.findMany({
      where: { campaignId },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(flowcharts);
  } catch (error) {
    console.error('Error fetching flowcharts:', error);
    return NextResponse.json({ error: 'Failed to fetch flowcharts' }, { status: 500 });
  }
}

// POST /api/campaigns/[id]/flowcharts - Create a new flowchart for a campaign
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const campaignId = parseInt(params.id);
    if (isNaN(campaignId)) {
      return NextResponse.json({ error: 'Invalid campaign ID' }, { status: 400 });
    }

    const body = await request.json();
    const { name, data } = body;

    if (!name) {
      return NextResponse.json({ error: 'Flowchart name is required' }, { status: 400 });
    }

    // Ensure data is at least an empty object if not provided, or valid JSON
    const flowchartData = data || { nodes: [], edges: [] };

    const newFlowchart = await prisma.flowchart.create({
      data: {
        name,
        data: flowchartData,
        campaignId,
      },
    });
    return NextResponse.json(newFlowchart, { status: 201 });
  } catch (error: any) {
    console.error('Error creating flowchart:', error);
    if (error.code === 'P2002' && error.meta?.target?.includes('name') && error.meta?.target?.includes('campaignId')) {
      return NextResponse.json({ error: 'A flowchart with this name already exists for this campaign.' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Failed to create flowchart' }, { status: 500 });
  }
} 