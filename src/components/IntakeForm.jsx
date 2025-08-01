import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import FormField from './FormField';
import CheckboxGroup from './CheckboxGroup';
import RadioGroup from './RadioGroup';
import { submitToSupabase, supabase } from '../services/supabase';
import { sendEmail } from '../services/emailjs';

const { FiSend, FiCheck, FiCamera, FiFilm } = FiIcons;

const IntakeForm = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        primaryGoal: [],
        primaryGoalOther: '',
        additionalContext: '',
        storyMessage: '',
        mainTheme: '',
        keyPeople: '',
        hasScript: '',
        scriptDescription: '',
        primaryAudience: [],
        primaryAudienceOther: '',
        audienceAction: '',
        toneStyle: [],
        toneStyleOther: '',
        primaryPlatform: [],
        primaryPlatformOther: '',
        idealLength: '',
        deadline: '', // Keep as empty string initially for the input field
        productionNeeds: '',
        visualReferences: '',
        challenges: '',
        pointOfContact: '',
        involvement: ''
    });

    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    // New state to manage logo loading status
    const [logoLoadError, setLogoLoadError] = useState(false);


    // --- START: ADDED CODE FOR DIAGNOSTIC READ TEST ---
    // This useEffect will run once when the component mounts to test Supabase read capabilities
    useEffect(() => {
        const testRead = async () => {
            console.log('--- Supabase Read Test Initiated ---');
            try {
                // Attempt to select a single record from the table
                const { data, error } = await supabase
                    .from('documentary_intake') // Ensure this table name is correct
                    .select('*')
                    .limit(1); // Limit to 1 record for a quick check

                if (error) {
                    console.error('Supabase Read Test Error:', error);
                    // Log the exact status code if available
                    if (error.status) console.error('Supabase Read Test Error Status:', error.status);
                    // Log the full error object for more details
                    console.error('Supabase Read Test Full Error Object:', error);
                } else {
                    console.log('Supabase Read Test Success! Data:', data);
                    if (data.length === 0) {
                        console.log('Supabase Read Test: Table is empty, which is expected for a fresh setup.');
                    }
                }
            } catch (err) {
                console.error('Supabase Read Test Caught Exception:', err);
            }
            console.log('--- Supabase Read Test Finished ---');
        };

        // Call the test function
        testRead();
    }, []); // Empty dependency array ensures this runs only once on mount
    // --- END: ADDED CODE FOR DIAGNOSTIC READ TEST ---


    const primaryGoalOptions = [
        'Raise awareness',
        'Inspire action',
        'Tell a personal or brand story',
        'Educate',
        'Entertain',
        'Other'
    ];

    const primaryAudienceOptions = [
        'General public',
        'Internal team',
        'Industry peers',
        'Specific community or niche',
        'Other'
    ];

    const toneStyleOptions = [
        'Emotional',
        'Journalistic',
        'Raw and real',
        'Cinematic',
        'Light-hearted',
        'Experimental',
        'Other'
    ];

    const primaryPlatformOptions = [
        'YouTube',
        'Website',
        'Social Media (Instagram/Facebook/TikTok)',
        'Film festivals',
        'Broadcast/TV',
        'Internal distribution',
        'Other'
    ];

    const scriptOptions = [
        { value: 'yes', label: 'Yes (with file upload or description)' },
        { value: 'no', label: 'No - need help developing' },
        { value: 'developing', label: "It's still taking shape" }
    ];

    const productionOptions = [
        { value: 'full', label: 'Need full production' },
        { value: 'existing', label: 'Have existing footage' },
        { value: 'mix', label: 'Mix of both' }
    ];

    const involvementOptions = [
        { value: 'very', label: 'Very involved' },
        { value: 'collaborative', label: 'Collaborative' },
        { value: 'hands-off', label: 'Light touch / hands-off' }
    ];

    const handleInputChange = (name, value) => {
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.name.trim()) newErrors.name = 'Name is required';
        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Please enter a valid email address';
        }
        if (formData.primaryGoal.length === 0) newErrors.primaryGoal = 'Please select at least one goal';
        if (!formData.storyMessage.trim()) newErrors.storyMessage = 'Story message is required';
        if (!formData.mainTheme.trim()) newErrors.mainTheme = 'Main theme is required';
        if (formData.primaryAudience.length === 0) newErrors.primaryAudience = 'Please select at least one audience';
        if (!formData.audienceAction.trim()) newErrors.audienceAction = 'Audience action is required';
        if (formData.toneStyle.length === 0) newErrors.toneStyle = 'Please select at least one tone/style';
        if (formData.primaryPlatform.length === 0) newErrors.primaryPlatform = 'Please select at least one platform';
        if (!formData.hasScript) newErrors.hasScript = 'Please select an option';
        if (!formData.productionNeeds) newErrors.productionNeeds = 'Please select an option';
        if (!formData.pointOfContact.trim()) newErrors.pointOfContact = 'Point of contact is required';
        if (!formData.involvement) newErrors.involvement = 'Please select involvement level';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        setIsSubmitting(true);

        try {
            // Prepare data for Supabase, handling optional fields and snake_case mapping
            const dataToSend = { ...formData };

            // Handle deadline: send null if empty string, as 'DATE' type in Supabase doesn't accept empty string
            if (dataToSend.deadline === '') {
                dataToSend.deadline = null;
            }

            // Explicitly map formData (camelCase) to Supabase table columns (snake_case)
            // This ensures consistency with the database schema defined by your SQL.
            const supabaseFormattedData = {
                name: dataToSend.name,
                email: dataToSend.email,
                primary_goal: dataToSend.primaryGoal, // Assuming Supabase handles array directly
                primary_goal_other: dataToSend.primaryGoalOther,
                additional_context: dataToSend.additionalContext,
                story_message: dataToSend.storyMessage,
                main_theme: dataToSend.mainTheme,
                key_people: dataToSend.keyPeople,
                has_script: dataToSend.hasScript,
                script_description: dataToSend.scriptDescription,
                primary_audience: dataToSend.primaryAudience, // Assuming Supabase handles array directly
                primary_audience_other: dataToSend.primaryAudienceOther,
                audience_action: dataToSend.audienceAction,
                tone_style: dataToSend.toneStyle, // Assuming Supabase handles array directly
                tone_style_other: dataToSend.toneStyleOther,
                primary_platform: dataToSend.primaryPlatform, // Assuming Supabase handles array directly
                primary_platform_other: dataToSend.primaryPlatformOther,
                ideal_length: dataToSend.idealLength,
                deadline: dataToSend.deadline, // Now correctly null or a date string
                production_needs: dataToSend.productionNeeds,
                visual_references: dataToSend.visualReferences,
                challenges: dataToSend.challenges,
                point_of_contact: dataToSend.pointOfContact, // Matches snake_case column name
                involvement: dataToSend.involvement,
                submitted_at: new Date().toISOString() // Add submitted_at field with current timestamp
            };


            // Pass the prepared and formatted data to submitToSupabase
            await submitToSupabase(supabaseFormattedData);
            // Pass original formData to sendEmail if the template expects camelCase, or map similarly if it expects snake_case
            await sendEmail(formData);

            setIsSubmitted(true);
        } catch (error) {
            console.error('Submission error:', error);
            // Provide a user-friendly alert, not just the technical error
            alert('There was an error submitting your form. Please check your inputs and try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isSubmitted) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center px-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-gray-800/80 backdrop-blur-sm rounded-2xl p-8 max-w-md w-full text-center border border-gray-700/50 shadow-xl"
                >
                    <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                        <SafeIcon icon={FiCheck} className="text-white text-2xl" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-4">Thank You!</h2>
                    <p className="text-gray-300 text-lg leading-relaxed">
                        Thanks for submitting your project – we'll be in touch soon.
                    </p>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black py-12 px-4">
            <div className="max-w-4xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-12"
                >
                    <div className="flex items-center justify-center mb-6">
                        {/* --- START: UPDATED CODE FOR LOGO WITH FALLBACK --- */}
                        {logoLoadError ? (
                            // Fallback to h1 text if logo fails to load
                            <h1 className="text-4xl font-bold text-white">
                                Angus Ashton Film
                            </h1>
                        ) : (
                            // Attempt to load the logo image
                            <img
                                src="https://angusashtonfilm.com/wp-content/uploads/2022/07/logo-600-wide-white-text.png" // <--- YOUR LOGO URL HERE
                                alt="Angus Ashton Film Logo" // Updated alt text
                                className="h-5 md:h-12 max-w-full rounded-md" // Adjust height as needed
                                // On error, set logoLoadError state to true to trigger fallback
                                onError={() => setLogoLoadError(true)}
                            />
                        )}
                        {/* --- END: UPDATED CODE FOR LOGO WITH FALLBACK --- */}
                    </div>
                    <h2 className="text-2xl font-semibold text-blue-400 mb-4">
                        Documentary Project Intake
                    </h2>
                    <p className="text-gray-300 text-lg max-w-2xl mx-auto">
                        Please fill out this form in as much detail as possible <br></br> so we can understand your story and goals.
                    </p>
                </motion.div>

                <motion.form
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    onSubmit={handleSubmit}
                    className="bg-gray-800/70 backdrop-blur-sm rounded-2xl p-8 border border-gray-700/50 shadow-2xl"
                >
                    <div className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField
                                label="Your Name"
                                required
                                error={errors.name}
                            >
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => handleInputChange('name', e.target.value)}
                                    className="w-full px-4 py-3 bg-gray-700/80 border border-gray-600/80 rounded-lg text-white placeholder-gray-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all"
                                    placeholder="Enter your full name"
                                />
                            </FormField>

                            <FormField
                                label="Your Email"
                                required
                                error={errors.email}
                            >
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => handleInputChange('email', e.target.value)}
                                    className="w-full px-4 py-3 bg-gray-700/80 border border-gray-600/80 rounded-lg text-white placeholder-gray-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all"
                                    placeholder="your@email.com"
                                />
                            </FormField>
                        </div>

                        <CheckboxGroup
                            label="Primary Goal of the Documentary"
                            required
                            options={primaryGoalOptions}
                            values={formData.primaryGoal}
                            onChange={(values) => handleInputChange('primaryGoal', values)}
                            otherValue={formData.primaryGoalOther}
                            onOtherChange={(value) => handleInputChange('primaryGoalOther', value)}
                            error={errors.primaryGoal}
                        />

                        <FormField
                            label="Additional context about your goal (optional)"
                        >
                            <textarea
                                value={formData.additionalContext}
                                onChange={(e) => handleInputChange('additionalContext', e.target.value)}
                                rows={3}
                                className="w-full px-4 py-3 bg-gray-700/80 border border-gray-600/80 rounded-lg text-white placeholder-gray-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all resize-none"
                                placeholder="Provide any additional context about your goals..."
                            />
                        </FormField>

                        <FormField
                            label="In one sentence, what is the story or message?"
                            required
                            error={errors.storyMessage}
                        >
                            <input
                                type="text"
                                value={formData.storyMessage}
                                onChange={(e) => handleInputChange('storyMessage', e.target.value)}
                                className="w-full px-4 py-3 bg-gray-700/80 border border-gray-600/80 rounded-lg text-white placeholder-gray-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all"
                                placeholder="Describe your story in one clear sentence..."
                            />
                        </FormField>

                        <FormField
                            label="Main theme or subject matter"
                            required
                            error={errors.mainTheme}
                        >
                            <input
                                type="text"
                                value={formData.mainTheme}
                                onChange={(e) => handleInputChange('mainTheme', e.target.value)}
                                className="w-full px-4 py-3 bg-gray-700/80 border border-gray-600/80 rounded-lg text-white placeholder-gray-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all"
                                placeholder="e.g., Environmental conservation, Personal journey, Business story..."
                            />
                        </FormField>

                        <FormField
                            label="Key people or characters involved"
                        >
                            <textarea
                                value={formData.keyPeople}
                                onChange={(e) => handleInputChange('keyPeople', e.target.value)}
                                rows={3}
                                className="w-full px-4 py-3 bg-gray-700/80 border border-gray-600/80 rounded-lg text-white placeholder-gray-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all resize-none"
                                placeholder="Describe the main people or characters in your documentary..."
                            />
                        </FormField>

                        <RadioGroup
                            label="Do you already have a script or rough outline?"
                            required
                            options={scriptOptions}
                            value={formData.hasScript}
                            onChange={(value) => handleInputChange('hasScript', value)}
                            error={errors.hasScript}
                        />

                        {formData.hasScript === 'yes' && (
                            <FormField
                                label="Please describe your script or outline"
                            >
                                <textarea
                                    value={formData.scriptDescription}
                                    onChange={(e) => handleInputChange('scriptDescription', e.target.value)}
                                    rows={3}
                                    className="w-full px-4 py-3 bg-gray-700/80 border border-gray-600/80 rounded-lg text-white placeholder-gray-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all resize-none"
                                    placeholder="Describe your existing script or outline..."
                                />
                            </FormField>
                        )}

                        <CheckboxGroup
                            label="Primary audience"
                            required
                            options={primaryAudienceOptions}
                            values={formData.primaryAudience}
                            onChange={(values) => handleInputChange('primaryAudience', values)}
                            otherValue={formData.primaryAudienceOther}
                            onOtherChange={(value) => handleInputChange('primaryAudienceOther', value)}
                            error={errors.primaryAudience}
                        />

                        <FormField
                            label="What do you want the audience to think, feel, or do after watching?"
                            required
                            error={errors.audienceAction}
                        >
                            <textarea
                                value={formData.audienceAction}
                                onChange={(e) => handleInputChange('audienceAction', e.target.value)}
                                rows={3}
                                className="w-full px-4 py-3 bg-gray-700/80 border border-gray-600/80 rounded-lg text-white placeholder-gray-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all resize-none"
                                placeholder="Describe the desired impact on your audience..."
                            />
                        </FormField>

                        <CheckboxGroup
                            label="Tone or style you're aiming for"
                            required
                            options={toneStyleOptions}
                            values={formData.toneStyle}
                            onChange={(values) => handleInputChange('toneStyle', values)}
                            otherValue={formData.toneStyleOther}
                            onOtherChange={(value) => handleInputChange('toneStyleOther', value)}
                            error={errors.toneStyle}
                        />

                        <CheckboxGroup
                            label="Primary platform"
                            required
                            options={primaryPlatformOptions}
                            values={formData.primaryPlatform}
                            onChange={(values) => handleInputChange('primaryPlatform', values)}
                            otherValue={formData.primaryPlatformOther}
                            onOtherChange={(value) => handleInputChange('primaryPlatformOther', value)}
                            error={errors.primaryPlatform}
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField
                                label="Ideal length or runtime"
                            >
                                <input
                                    type="text"
                                    value={formData.idealLength}
                                    onChange={(e) => handleInputChange('idealLength', e.target.value)}
                                    className="w-full px-4 py-3 bg-gray-700/80 border border-gray-600/80 rounded-lg text-white placeholder-gray-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all"
                                    placeholder="e.g., 5-10 minutes, 30 minutes, 1 hour"
                                />
                            </FormField>

                            <FormField
                                label="Deadline or launch date"
                            >
                                <input
                                    type="date"
                                    value={formData.deadline}
                                    onChange={(e) => handleInputChange('deadline', e.target.value)}
                                    className="w-full px-4 py-3 bg-gray-700/80 border border-gray-600/80 rounded-lg text-white focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all"
                                />
                            </FormField>
                        </div>

                        <RadioGroup
                            label="Do you have footage or need full production?"
                            required
                            options={productionOptions}
                            value={formData.productionNeeds}
                            onChange={(value) => handleInputChange('productionNeeds', value)}
                            error={errors.productionNeeds}
                        />

                        <FormField
                            label="Any visual references or inspiration?"
                        >
                            <textarea
                                value={formData.visualReferences}
                                onChange={(e) => handleInputChange('visualReferences', e.target.value)}
                                rows={3}
                                className="w-full px-4 py-3 bg-gray-700/80 border border-gray-600/80 rounded-lg text-white placeholder-gray-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all resize-none"
                                placeholder="Share any links, references, or describe the visual style you're envisioning..."
                            />
                        </FormField>

                        <FormField
                            label="Any challenges or sensitivities in the story?"
                        >
                            <textarea
                                value={formData.challenges}
                                onChange={(e) => handleInputChange('challenges', e.target.value)}
                                rows={3}
                                className="w-full px-4 py-3 bg-gray-700/80 border border-gray-600/80 rounded-lg text-white placeholder-gray-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all resize-none"
                                placeholder="Describe any potential challenges or sensitive topics..."
                            />
                        </FormField>

                        <FormField
                            label="Main point of contact for this project"
                            required
                            error={errors.pointOfContact}
                        >
                            <input
                                type="text"
                                value={formData.pointOfContact}
                                onChange={(e) => handleInputChange('pointOfContact', e.target.value)}
                                className="w-full px-4 py-3 bg-gray-700/80 border border-gray-600/80 rounded-lg text-white placeholder-gray-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all"
                                placeholder="Who should we contact regarding this project?"
                            />
                        </FormField>

                        <RadioGroup
                            label="How involved do you want to be in the creative process?"
                            required
                            options={involvementOptions}
                            value={formData.involvement}
                            onChange={(value) => handleInputChange('involvement', value)}
                            error={errors.involvement}
                        />
                    </div>

                    <div className="mt-10 pt-8 border-t border-gray-700/50">
                        <motion.button
                            type="submit"
                            disabled={isSubmitting}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 disabled:from-gray-600 disabled:to-gray-500 text-white font-semibold py-4 px-6 rounded-lg transition-all duration-200 flex items-center justify-center space-x-3 text-lg shadow-lg"
                        >
                            {isSubmitting ? (
                                <>
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                    <span>Submitting...</span>
                                </>
                            ) : (
                                <>
                                    <SafeIcon icon={FiSend} className="text-xl" />
                                    <span>Submit Project Intake</span>
                                </>
                            )}
                        </motion.button>
                    </div>
                </motion.form>
            </div>
        </div>
    );
};

export default IntakeForm;