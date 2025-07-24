// src/services/supabase.js
import { createClient } from '@supabase/supabase-js';

// --- CORRECT WAY TO ACCESS ENV VARS IN VITE ---
// These variables are loaded from your .env file at the root of your project
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Ensure that these environment variables are actually set.
// If not, supabaseUrl and supabaseKey will be 'undefined', leading to errors.
if (!supabaseUrl || !supabaseKey) {
    console.error("Supabase URL or Anon Key is not defined in environment variables.");
    // In a real app, you might want to throw an error or display a user-friendly message
}

// --- FIX: Add 'export' here so IntakeForm.jsx can import it ---
export const supabase = createClient(supabaseUrl, supabaseKey);

export const submitToSupabase = async (formData) => {
    console.log("Attempting to submit data to Supabase:", formData); // Keep this for debugging

    try {
        const { data, error } = await supabase
            .from('documentary_intake') // Make sure this table name 'documentary_intake' is correct in your Supabase project
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
            ])
            .select(); // It's good practice to add .select() to get the inserted data back

        if (error) {
            console.error('Supabase Insertion Error Details:', error); // Log the full error
            throw error; // Propagate the error up
        }
        console.log('Supabase Data Inserted Successfully:', data); // Log success data
        return data;
    } catch (error) {
        console.error('Error submitting to Supabase:', error); // Catch any unexpected errors
        throw error; // Re-throw to be handled by IntakeForm.js
    }
};
