import emailjs from 'emailjs-com';

const SERVICE_ID = 'service_aaf';
const TEMPLATE_ID = 'documentary-intake';
const USER_ID = 'VM85hk8cpaGMF9Qb4';

export const sendEmail = async (formData) => {
  try {
    const templateParams = {
      to_email: 'angus@angusashton.com',
      from_name: formData.name,
      from_email: formData.email,
      subject: 'New Documentary Project Intake Form Submission',
      message: formatFormDataForEmail(formData)
    };

    const response = await emailjs.send(
      SERVICE_ID,
      TEMPLATE_ID,
      templateParams,
      USER_ID
    );

    return response;
  } catch (error) {
    console.error('EmailJS error:', error);
    throw error;
  }
};

const formatFormDataForEmail = (formData) => {
  return `
New Documentary Project Intake Form Submission

Contact Information:
- Name: ${formData.name}
- Email: ${formData.email}
- Point of Contact: ${formData.pointOfContact}

Project Overview:
- Primary Goal: ${formData.primaryGoal.join(', ')}${formData.primaryGoalOther ? ` (Other: ${formData.primaryGoalOther})` : ''}
- Story/Message: ${formData.storyMessage}
- Main Theme: ${formData.mainTheme}
- Key People: ${formData.keyPeople}

Script & Development:
- Has Script: ${formData.hasScript}
${formData.scriptDescription ? `- Script Description: ${formData.scriptDescription}` : ''}

Audience & Impact:
- Primary Audience: ${formData.primaryAudience.join(', ')}${formData.primaryAudienceOther ? ` (Other: ${formData.primaryAudienceOther})` : ''}
- Desired Audience Action: ${formData.audienceAction}

Style & Distribution:
- Tone/Style: ${formData.toneStyle.join(', ')}${formData.toneStyleOther ? ` (Other: ${formData.toneStyleOther})` : ''}
- Primary Platform: ${formData.primaryPlatform.join(', ')}${formData.primaryPlatformOther ? ` (Other: ${formData.primaryPlatformOther})` : ''}
- Ideal Length: ${formData.idealLength}
- Deadline: ${formData.deadline}

Production:
- Production Needs: ${formData.productionNeeds}
- Visual References: ${formData.visualReferences}
- Challenges: ${formData.challenges}
- Involvement Level: ${formData.involvement}

Additional Context:
${formData.additionalContext}

Submitted: ${new Date().toLocaleString()}
  `;
};