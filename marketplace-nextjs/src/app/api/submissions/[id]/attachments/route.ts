import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { writeFile } from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

// POST /api/submissions/[id]/attachments - Upload attachments
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const submissionId = params.id;

    // Check ownership
    const submission = await prisma.componentSubmission.findUnique({
      where: { id: submissionId },
      select: { userId: true }
    });

    if (!submission || submission.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Submission not found or unauthorized' },
        { status: 404 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const type = formData.get('type') as string;
    const description = formData.get('description') as string || '';

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate attachment type
    const validTypes = ['screenshot', 'demo_video', 'documentation', 'test_file'];
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { error: 'Invalid attachment type' },
        { status: 400 }
      );
    }

    // Validate file type based on attachment type
    const fileType = file.type;
    if (type === 'screenshot' && !fileType.startsWith('image/')) {
      return NextResponse.json(
        { error: 'Screenshots must be image files' },
        { status: 400 }
      );
    }
    if (type === 'demo_video' && !fileType.startsWith('video/')) {
      return NextResponse.json(
        { error: 'Demo videos must be video files' },
        { status: 400 }
      );
    }

    // Generate unique filename
    const fileExtension = path.extname(file.name);
    const fileName = `${uuidv4()}${fileExtension}`;
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'submissions', submissionId);
    const filePath = path.join(uploadDir, fileName);
    const fileUrl = `/uploads/submissions/${submissionId}/${fileName}`;

    // Create upload directory
    await writeFile(filePath, Buffer.from(await file.arrayBuffer()));

    // Save attachment record
    const attachment = await prisma.submissionAttachment.create({
      data: {
        submissionId,
        fileName: file.name,
        fileType,
        fileSizeBytes: file.size,
        fileUrl,
        attachmentType: type.toUpperCase() as any,
        description
      }
    });

    return NextResponse.json(attachment);
  } catch (error) {
    console.error('Error uploading attachment:', error);
    return NextResponse.json(
      { error: 'Failed to upload attachment' },
      { status: 500 }
    );
  }
}

// GET /api/submissions/[id]/attachments - Get submission attachments
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const attachments = await prisma.submissionAttachment.findMany({
      where: { submissionId: params.id },
      orderBy: { uploadedAt: 'desc' }
    });

    return NextResponse.json({ attachments });
  } catch (error) {
    console.error('Error fetching attachments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch attachments' },
      { status: 500 }
    );
  }
}

// DELETE /api/submissions/[id]/attachments/[attachmentId] - Delete attachment
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; attachmentId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check ownership
    const attachment = await prisma.submissionAttachment.findUnique({
      where: { id: params.attachmentId },
      include: {
        submission: {
          select: { userId: true }
        }
      }
    });

    if (!attachment || attachment.submission.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Attachment not found or unauthorized' },
        { status: 404 }
      );
    }

    // Delete file from filesystem
    // In production, this would delete from cloud storage
    // For now, we'll just delete the database record

    await prisma.submissionAttachment.delete({
      where: { id: params.attachmentId }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting attachment:', error);
    return NextResponse.json(
      { error: 'Failed to delete attachment' },
      { status: 500 }
    );
  }
}