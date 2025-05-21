import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

// GET /api/flowcharts/[flowchartId] - Get a specific flowchart
export async function GET(
  request: NextRequest,
  { params: paramsPromise }: { params: Promise<{ flowchartId: string }> }
) {
  try {
    const params = await paramsPromise;
    const flowchart = await prisma.flowchart.findUnique({
      where: { id: params.flowchartId },
    });
    if (!flowchart) {
      return NextResponse.json({ error: 'Flowchart not found' }, { status: 404 });
    }
    return NextResponse.json(flowchart);
  } catch (error) {
    console.error('Error fetching flowchart:', error);
    return NextResponse.json({ error: 'Failed to fetch flowchart' }, { status: 500 });
  }
}

// PUT /api/flowcharts/[flowchartId] - Update a specific flowchart
export async function PUT(
  request: NextRequest,
  { params: paramsPromise }: { params: Promise<{ flowchartId: string }> }
) {
  try {
    const params = await paramsPromise;
    const body = await request.json();
    const { name, data } = body;

    if (!name && !data) {
      return NextResponse.json({ error: 'Name or data must be provided for update' }, { status: 400 });
    }
    
    // Ensure data is valid JSON if provided
    if (data && (typeof data !== 'object' || data === null)) {
      return NextResponse.json({ error: 'Invalid data format for flowchart' }, { status: 400 });
    }

    const updatedFlowchart = await prisma.flowchart.update({
      where: { id: params.flowchartId },
      data: {
        ...(name && { name }),
        ...(data && { data }),
      },
    });
    return NextResponse.json(updatedFlowchart);
  } catch (error: any) {
    console.error('Error updating flowchart:', error);
    if (error.code === 'P2025') { // Record to update not found
        return NextResponse.json({ error: 'Flowchart not found for update' }, { status: 404 });
    }
    if (error.code === 'P2002' && error.meta?.target?.includes('name') && error.meta?.target?.includes('campaignId')) {
        // This unique constraint is on (name, campaignId). Since we don't have campaignId here directly,
        // this error is less likely unless name itself is globally unique which is not specified.
        // For now, a generic conflict for name if it were to happen.
        return NextResponse.json({ error: 'A flowchart with this name may already exist causing a conflict.' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Failed to update flowchart' }, { status: 500 });
  }
}

// DELETE /api/flowcharts/[flowchartId] - Delete a specific flowchart
export async function DELETE(
  request: NextRequest,
  { params: paramsPromise }: { params: Promise<{ flowchartId: string }> }
) {
  try {
    const params = await paramsPromise;
    await prisma.flowchart.delete({
      where: { id: params.flowchartId },
    });
    return NextResponse.json({ message: 'Flowchart deleted successfully' }, { status: 200 }); // Or 204 No Content
  } catch (error: any) {
    console.error('Error deleting flowchart:', error);
    if (error.code === 'P2025') { // Record to delete not found
        return NextResponse.json({ error: 'Flowchart not found for deletion' }, { status: 404 });
    }
    return NextResponse.json({ error: 'Failed to delete flowchart' }, { status: 500 });
  }
} 