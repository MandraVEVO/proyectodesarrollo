import { Cliente } from "src/cliente/entities/cliente.entity";
import { Empresa } from "src/empresa/entities/empresa.entity";
import { BeforeInsert, BeforeUpdate, Column, Entity, OneToOne, PrimaryGeneratedColumn } from "typeorm";


@Entity('usuario')
export class Auth {
    
    @PrimaryGeneratedColumn('uuid')
    id: string;
    @Column('text')
    nombre: string;
    @Column('text',
        {
            unique: true,
        }
    )
    email: string;
    @Column()
    telefono: string;
    @Column('text',
        {
            unique: false,
        }
    )
    password: string;
    @Column({
        type: 'text',
        array: true,
        default: ['cliente'],
    })
    rol: string[];

    @Column('bool',{
        default: true,
    })
    isActive: boolean;


    @OneToOne(()=> Cliente, cliente => cliente.user_id)
    cliente: Cliente

    @OneToOne(()=> Empresa, empresa => empresa.user_id)
    empresa: Empresa


     @BeforeInsert()
    checkFieldBeforeInsert() {
        this.email = this.email.toLowerCase().trim();
    }

    @BeforeUpdate()
    checkFieldBeforeUpdate() {
        this.checkFieldBeforeInsert();
    }
}
