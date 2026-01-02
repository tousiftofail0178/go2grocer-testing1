// Email utility for sending notifications
// TODO: Replace with actual email service (SendGrid, Resend, etc.)

interface RejectionEmailParams {
    to: string;
    businessName: string;
    reason: string;
}

export async function sendRejectionEmail(params: RejectionEmailParams) {
    const { to, businessName, reason } = params;

    console.log(`📧 Sending rejection email to: ${to}`);
    console.log(`Business: ${businessName}`);
    console.log(`Reason: ${reason}`);

    // TODO: Integrate with actual email service
    // For now, this is a placeholder that logs the email content

    const emailContent = `
        Subject: Action Required: Update Your Business Application
        
        Dear ${businessName} Team,
        
        Your business registration application has been reviewed and requires updates before we can proceed.
        
        Rejection Reason:
        ${reason}
        
        What to do next:
        1. Log in to your dashboard at ${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}
        2. Review the feedback above
        3. Update your application with the corrected information
        4. Click "Resubmit Application" when ready
        
        Your application will be reviewed again once resubmitted.
        
        If you have any questions, please contact our support team.
        
        Best regards,
        Go2Grocer Team
    `;

    console.log('Email Content:', emailContent);

    // TODO: Replace with actual email sending
    // Example with Resend:
    // const resend = new Resend(process.env.RESEND_API_KEY);
    // await resend.emails.send({
    //     from: 'noreply@go2grocer.com',
    //     to: to,
    //     subject: 'Action Required: Update Your Business Application',
    //     html: emailContent,
    // });

    return {
        success: true,
        message: 'Email logged (not sent - integration pending)',
    };
}
