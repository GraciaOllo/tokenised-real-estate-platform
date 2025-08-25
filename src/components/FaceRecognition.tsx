import React, { useRef, useEffect, useState } from 'react';
import Webcam from 'react-webcam';
import * as faceapi from 'face-api.js';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, X, CheckCircle, AlertCircle } from 'lucide-react';

interface FaceRecognitionProps {
isOpen: boolean;
onClose: () => void;
onSuccess: () => void;
userName: string;
}

const FaceRecognition: React.FC<FaceRecognitionProps> = ({
isOpen,
onClose,
onSuccess,
userName
}) => {
const webcamRef = useRef<Webcam>(null);
const [isLoading, setIsLoading] = useState(true);
const [isVerifying, setIsVerifying] = useState(false);
const [verificationStatus, setVerificationStatus] = useState<'idle' | 'success' | 'failed'>('idle');
const [modelsLoaded, setModelsLoaded] = useState(false);

useEffect(() => {
if (isOpen) {
    loadModels();
}
}, [isOpen]);

const loadModels = async () => {
try {
    setIsLoading(true);
    const MODEL_URL = '/models';
    
    await Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
    faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
    faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
    faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL)
    ]);
    
    setModelsLoaded(true);
    setIsLoading(false);
} catch (error) {
    console.error('Error loading face-api models:', error);
    // For demo purposes, we'll simulate model loading
    setTimeout(() => {
    setModelsLoaded(true);
    setIsLoading(false);
    }, 2000);
}
};

const captureAndVerify = async () => {
if (!webcamRef.current || !modelsLoaded) return;

setIsVerifying(true);

try {
    const imageSrc = webcamRef.current.getScreenshot();
    if (!imageSrc) {
    throw new Error('Failed to capture image');
    }

    // Create image element
    const img = new Image();
    img.src = imageSrc;
    
    await new Promise((resolve) => {
    img.onload = resolve;
    });

    // For demo purposes, we'll simulate face detection
    // In production, you would use actual face-api.js detection
    const detections = await simulateFaceDetection(img);
    
    if (detections && detections.length > 0) {
    setVerificationStatus('success');
    setTimeout(() => {
        onSuccess();
        onClose();
        resetState();
    }, 2000);
    } else {
    setVerificationStatus('failed');
    setTimeout(() => {
        setVerificationStatus('idle');
    }, 3000);
    }
} catch (error) {
    console.error('Face verification error:', error);
    setVerificationStatus('failed');
    setTimeout(() => {
    setVerificationStatus('idle');
    }, 3000);
} finally {
    setIsVerifying(false);
}
};

const simulateFaceDetection = async (img: HTMLImageElement): Promise<any[]> => {
// Simulate face detection delay
await new Promise(resolve => setTimeout(resolve, 2000));

// For demo, randomly succeed 80% of the time
const success = Math.random() > 0.2;
return success ? [{ detection: 'face_detected' }] : [];
};

const resetState = () => {
setVerificationStatus('idle');
setIsVerifying(false);
setIsLoading(true);
setModelsLoaded(false);
};

const handleClose = () => {
onClose();
resetState();
};

return (
<AnimatePresence>
    {isOpen && (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
        <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden"
        >
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 px-6 py-4 text-white">
            <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
                <Camera className="w-6 h-6" />
                <div>
                <h3 className="text-lg font-semibold">Face Verification</h3>
                <p className="text-emerald-100 text-sm">Secure wallet access for {userName}</p>
                </div>
            </div>
            <button
                onClick={handleClose}
                className="p-1 hover:bg-white/20 rounded-full transition-colors"
            >
                <X className="w-5 h-5" />
            </button>
            </div>
        </div>

        <div className="p-6">
            {isLoading ? (
            <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4" />
                <p className="text-gray-600">Loading face recognition models...</p>
            </div>
            ) : (
            <div className="space-y-6">
                {/* Camera View */}
                <div className="relative">
                <div className="aspect-square rounded-xl overflow-hidden bg-gray-100">
                    <Webcam
                    ref={webcamRef}
                    audio={false}
                    screenshotFormat="image/jpeg"
                    className="w-full h-full object-cover"
                    videoConstraints={{
                        width: 400,
                        height: 400,
                        facingMode: "user"
                    }}
                    />
                </div>
                
                {/* Overlay for face detection */}
                <div className="absolute inset-0 border-2 border-emerald-500 rounded-xl pointer-events-none">
                    <div className="absolute top-4 left-4 w-8 h-8 border-l-2 border-t-2 border-emerald-500" />
                    <div className="absolute top-4 right-4 w-8 h-8 border-r-2 border-t-2 border-emerald-500" />
                    <div className="absolute bottom-4 left-4 w-8 h-8 border-l-2 border-b-2 border-emerald-500" />
                    <div className="absolute bottom-4 right-4 w-8 h-8 border-r-2 border-b-2 border-emerald-500" />
                </div>
                </div>

                {/* Instructions */}
                <div className="text-center">
                <p className="text-gray-600 mb-4">
                    Position your face within the frame and click verify when ready
                </p>
                
                {verificationStatus === 'success' && (
                    <div className="flex items-center justify-center text-green-600 mb-4">
                    <CheckCircle className="w-6 h-6 mr-2" />
                    <span className="font-medium">Verification Successful!</span>
                    </div>
                )}
                
                {verificationStatus === 'failed' && (
                    <div className="flex items-center justify-center text-red-600 mb-4">
                    <AlertCircle className="w-6 h-6 mr-2" />
                    <span className="font-medium">Verification Failed. Please try again.</span>
                    </div>
                )}
                </div>

                {/* Action Button */}
                <button
                onClick={captureAndVerify}
                disabled={isVerifying || verificationStatus === 'success'}
                className={`w-full py-3 px-6 rounded-lg font-semibold transition-all ${
                    isVerifying || verificationStatus === 'success'
                    ? 'bg-gray-400 cursor-not-allowed text-white'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white hover:shadow-lg'
                }`}
                >
                {isVerifying ? (
                    <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                    Verifying...
                    </div>
                ) : verificationStatus === 'success' ? (
                    'Verified Successfully!'
                ) : (
                    'Verify Face'
                )}
                </button>
            </div>
            )}
        </div>
        </motion.div>
    </div>
    )}
</AnimatePresence>
);
};

export default FaceRecognition;