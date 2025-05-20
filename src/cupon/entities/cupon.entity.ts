import { Cliente } from "src/cliente/entities/cliente.entity";
import { Empresa } from "src/empresa/entities/empresa.entity";
import { Ticket } from "src/ticket/entities/ticket.entity";
import { Column, Entity, ManyToMany, ManyToOne, OneToOne, PrimaryGeneratedColumn } from "typeorm";


@Entity()
export class Cupon {
    @PrimaryGeneratedColumn('uuid')
    id: string
    
    @Column('text')
    titulo: string
    
    @Column('int')
    precio: number
    
    @Column('int')
    cantidad: number
    
    @Column('text')
    detalles: string

    @Column({
        default: true,
    })
    status: boolean

    @Column()
    fechaExpiracion: Date

    @ManyToMany(
        () => Cliente,
        (cliente) => cliente.historial
    )
    clientes: Cliente[];

    @ManyToOne(
        () => Empresa,
        (empresa) => empresa.cupones,
        { onDelete: 'CASCADE' } // Si se borra la empresa, se borran sus cupones
    )
    empresa: Empresa;

    @OneToOne(()=> Ticket, ticket => ticket.cupon)
    ticket: Ticket
    
}
