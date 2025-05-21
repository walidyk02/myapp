// import React, { useState } from 'react';
// import { Star } from 'lucide-react';
// import toast from 'react-hot-toast';

// interface ScriptFeedbackProps {
//   scriptId: string;
// }

// export function ScriptFeedback({ scriptId }: ScriptFeedbackProps) {
//   const [note, setNote] = useState<number>(0);
//   const [commentaire, setCommentaire] = useState<string>('');
//   const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (note === 0) {
//       toast.error('Veuillez sélectionner une note.');
//       return;
//     }
//     setIsSubmitting(true);
//     try {
//       const response = await fetch('/api/feedback', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ scriptId, note, commentaire }),
//       });
//       if (!response.ok) {
//         throw new Error('Erreur lors de l\'envoi du feedback');
//       }
//       toast.success('Merci pour votre feedback !');
//       setNote(0);
//       setCommentaire('');
//     } catch (error) {
//       toast.error((error as Error).message);
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   return (
//     <form onSubmit={handleSubmit} className="mt-6 p-4 border border-gray-600 rounded-md bg-gray-800 text-white max-w-md">
//       <h3 className="text-lg font-semibold mb-2">Donnez votre avis sur ce script</h3>
//       <div className="flex items-center mb-4">
//         {[1, 2, 3, 4, 5].map((star) => (
//           <Star
//             key={star}
//             className={`w-6 h-6 cursor-pointer ${star <= note ? 'text-yellow-400' : 'text-gray-500'}`}
//             onClick={() => setNote(star)}
//           />
//         ))}
//       </div>
//       <textarea
//         placeholder="Commentaires (optionnel)"
//         value={commentaire}
//         onChange={(e) => setCommentaire(e.target.value)}
//         className="w-full p-2 mb-4 rounded-md bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
//         rows={3}
//       />
//       <button
//         type="submit"
//         disabled={isSubmitting}
//         className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
//       >
//         {isSubmitting ? 'Envoi...' : 'Envoyer'}
//       </button>
//     </form>
//   );
// }
