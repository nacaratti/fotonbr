import React from 'react';
import CommentItem from '@/components/forum/CommentItem.jsx';

const CommentList = ({ comments, loading, onCommentUpdated, onCommentDeleted }) => {
  if (loading) {
    return <p>Carregando comentários...</p>;
  }

  if (comments.length === 0) {
    return <p className="text-muted-foreground">Nenhum comentário ainda. Seja o primeiro!</p>;
  }

  return (
    <div className="space-y-4">
      {comments.map(comment => (
        <CommentItem 
          key={comment.id} 
          comment={comment} 
          onCommentUpdated={onCommentUpdated}
          onCommentDeleted={onCommentDeleted}
        />
      ))}
    </div>
  );
};

export default CommentList;