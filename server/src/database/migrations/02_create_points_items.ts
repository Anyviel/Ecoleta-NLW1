import Knex from 'knex';

export async function up(knex: Knex) {
  //CRIAR TABELA
  return knex.schema.createTable('point_items', table => {
    table.increments('id').notNullable()
    table.integer('point_id').notNullable().references('id').inTable('points')
    table.integer('item_id').notNullable().references('id').inTable('items')
  });
}

export async function down(knex: Knex) {
  //DELETAR TABELA
  return knex.schema.dropTable('point_items')
}