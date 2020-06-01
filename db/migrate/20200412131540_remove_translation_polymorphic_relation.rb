class RemoveTranslationPolymorphicRelation < ActiveRecord::Migration[6.0]
  def up
    #Translation.where(resource_type: 'Word').delete_all

    #ActiveRecord::Migration.remove_index :translations, name: 'index_translations_on_resource_type_and_resource_id'
    #ActiveRecord::Migration.rename_column :translations, :resource_id, :verse_id
    #ActiveRecord::Migration.add_index :translations, :verse_id

    #ActiveRecord::Migration.remove_column :translations, :resource_type
  end
end
