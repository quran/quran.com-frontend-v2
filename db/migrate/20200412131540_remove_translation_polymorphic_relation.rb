class RemoveTranslationPolymorphicRelation < ActiveRecord::Migration[6.0]
  def up
    Translation.where(resource_type: 'Word').delete_all

    remove_index :translations, name: 'index_translations_on_resource_type_and_resource_id'
    rename_column :translations, :resource_id, :verse_id
    add_index :translations, :verse_id

    remove_column :translations, :resource_type
  end
end
