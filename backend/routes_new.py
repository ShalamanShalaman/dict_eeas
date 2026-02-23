# This is a helper file to show the changes needed
# The key change is in the review_document function:

# Change from:
"""
    reviewer_id = request.form.get('reviewer_id')
    reviewer = User.query.get_or_404(reviewer_id)

    if doc.reviewer_id != reviewer.id:
        return jsonify({'error': 'Unauthorized'}), 403

    status = request.form.get('status')
    note = request.form.get('note', '')
    if status not in ['approved', 'declined']:
        return jsonify({'error': 'Invalid status'}), 400

    if 'file' in request.files:
        file = request.files['file']
        filepath = save_file(file, folder='documents')
        doc.review_file_path = filepath

    doc.status = status
    doc.reviewer_note = note
    doc.reviewed_at = datetime.utcnow()
    db.session.commit()
    return jsonify({'message': f'Document {status}', 'document': doc.to_dict()})
"""

# To:
"""
    # Accept either reviewer_id or user_id
    reviewer_id = request.form.get('reviewer_id') or request.form.get('user_id')
    reviewer = User.query.filter_by(user_id=reviewer_id).first_or_404()

    if doc.reviewer_id != reviewer.id:
        return jsonify({'error': 'Unauthorized - you are not assigned to review this document'}), 403

    # Accept either status or action
    action = request.form.get('action') or request.form.get('status')
    
    if action == 'approve' or action == 'approved':
        doc.status = 'approved'
        doc.reviewed_at = datetime.utcnow()
        db.session.commit()
        return jsonify({'message': 'Document approved', 'document': doc.to_dict()})
    
    elif action == 'decline' or action == 'declined':
        # Accept either reason or note
        reason = request.form.get('reason') or request.form.get('note', '')
        doc.status = 'declined'
        doc.reviewer_note = reason
        doc.reviewed_at = datetime.utcnow()
        db.session.commit()
        return jsonify({'message': 'Document declined', 'document': doc.to_dict()})
    
    return jsonify({'error': 'Invalid action. Use action=approve or action=decline'}), 400
"""
