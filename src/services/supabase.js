import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://your-project.supabase.co';
const supabaseKey = 'your-anon-key';

const supabase = createClient(supabaseUrl, supabaseKey);

export const submitToSupabase = async (formData) => {
  try {
    const { data, error } = await supabase
      .from('documentary_intake')
      .insert([
        {
          name: formData.name,
          email: formData.email,
          primary_goal: formData.primaryGoal,
          primary_goal_other: formData.primaryGoalOther,
          additional_context: formData.additionalContext,
          story_message: formData.storyMessage,
          main_theme: formData.mainTheme,
          key_people: formData.keyPeople,
          has_script: formData.hasScript,
          script_description: formData.scriptDescription,
          primary_audience: formData.primaryAudience,
          primary_audience_other: formData.primaryAudienceOther,
          audience_action: formData.audienceAction,
          tone_style: formData.toneStyle,
          tone_style_other: formData.toneStyleOther,
          primary_platform: formData.primaryPlatform,
          primary_platform_other: formData.primaryPlatformOther,
          ideal_length: formData.idealLength,
          deadline: formData.deadline,
          production_needs: formData.productionNeeds,
          visual_references: formData.visualReferences,
          challenges: formData.challenges,
          point_of_contact: formData.pointOfContact,
          involvement: formData.involvement,
          submitted_at: new Date().toISOString()
        }
      ]);

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Supabase error:', error);
    throw error;
  }
};